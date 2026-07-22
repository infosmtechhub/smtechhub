function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
}

export async function onRequestPost({ request, env }) {
    try {
        const formData = await request.formData();

        const name = (formData.get('name') || '').toString().trim();
        const email = (formData.get('email') || '').toString().trim();
        const phone = (formData.get('phone') || '').toString().trim();
        const experience = (formData.get('experience') || '').toString().trim();
        const area = (formData.get('area_of_expertise') || '').toString().trim();
        const certifications = (formData.get('certifications') || '').toString().trim();
        const coverNote = (formData.get('cover_note') || '').toString().trim();
        const jobTitle = (formData.get('job_title') || '').toString().trim();
        const linkedin = (formData.get('linkedin') || '').toString().trim();
        const whyJoin = (formData.get('why_join') || '').toString().trim();
        const resumeFile = formData.get('resume');

        if (!name || !email || !phone) {
            return Response.json({ success: false, message: 'Missing required fields.' }, { status: 400 });
        }

        const attachments = [];
        if (resumeFile && typeof resumeFile === 'object' && typeof resumeFile.arrayBuffer === 'function') {
            const buffer = await resumeFile.arrayBuffer();
            const bytes = new Uint8Array(buffer);
            let binary = '';
            for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
            attachments.push({
                filename: resumeFile.name,
                content: btoa(binary),
            });
        }

        const rows = [
            ['Name', name],
            ['Email', email],
            ['Phone', phone],
            ['Job Title', jobTitle],
            ['Experience', experience],
            ['Area of Expertise', area],
            ['Certifications', certifications],
            ['LinkedIn', linkedin],
        ].filter(([, v]) => v);

        let html = rows.map(([k, v]) => `<p><strong>${escapeHtml(k)}:</strong> ${escapeHtml(v)}</p>`).join('');
        if (coverNote) html += `<p><strong>Cover Note:</strong><br>${escapeHtml(coverNote).replace(/\n/g, '<br>')}</p>`;
        if (whyJoin) html += `<p><strong>Why join:</strong><br>${escapeHtml(whyJoin).replace(/\n/g, '<br>')}</p>`;

        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${env.RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: env.RESEND_FROM || 'SMTECHHUB Careers <onboarding@resend.dev>',
                to: [env.RESEND_TO || 'infosmtechhub@gmail.com'],
                reply_to: email,
                subject: jobTitle ? `New Job Application: ${jobTitle}` : 'New Job Application - SMTECHHUB Careers',
                html,
                attachments,
            }),
        });

        const data = await res.json();
        if (!res.ok) {
            return Response.json({ success: false, message: data.message || 'Failed to send email.' }, { status: 502 });
        }
        return Response.json({ success: true });
    } catch (err) {
        return Response.json({ success: false, message: err.message }, { status: 500 });
    }
}
