import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from flask import current_app

def enviar_email_con_pdf(destinatario, asunto, cuerpo_html, pdf_bytes, nombre_adjunto):
    """Envía un email con un reporte en formato PDF adjunto."""
    try:
        msg = MIMEMultipart()
        msg['From'] = current_app.config['MAIL_DEFAULT_SENDER']
        msg['To'] = destinatario
        msg['Subject'] = asunto
        
        msg.attach(MIMEText(cuerpo_html, 'html'))
        
        if pdf_bytes:
            adjunto = MIMEApplication(pdf_bytes, _subtype='pdf')
            adjunto.add_header('Content-Disposition', 'attachment', filename=nombre_adjunto)
            msg.attach(adjunto)
        
        server = smtplib.SMTP(
            current_app.config['MAIL_SERVER'],
            current_app.config['MAIL_PORT']
        )
        server.starttls()
        server.login(
            current_app.config['MAIL_USERNAME'],
            current_app.config['MAIL_PASSWORD']
        )
        server.send_message(msg)
        server.quit()
        
        print(f"✅ Email enviado a {destinatario}")
        return True
        
    except Exception as e:
        print(f"❌ Error email: {str(e)}")
        return False