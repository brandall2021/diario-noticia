export function welcomeEmailTemplate(name: string, unsubscribeUrl: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="background-color:#dc2626;padding:30px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:28px;">Diario Noticia</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 30px;">
              <h2 style="color:#1a1a2e;margin:0 0 20px;font-size:22px;">¡Bienvenido${name ? ', ' + name : ''}!</h2>
              <p style="color:#4a4a68;font-size:16px;line-height:1.6;margin:0 0 20px;">
                Gracias por suscribirte a nuestro newsletter. Recibirás las noticias más importantes directamente en tu correo electrónico.
              </p>
              <p style="color:#4a4a68;font-size:16px;line-height:1.6;margin:0 0 30px;">
                Mantente al día con las últimas noticias, análisis y reportajes de nuestro equipo de periodistas.
              </p>
              <hr style="border:none;border-top:1px solid #e5e5e5;margin:30px 0;">
              <p style="color:#999999;font-size:12px;line-height:1.5;margin:0;">
                Si no solicitaste esta suscripción, puedes <a href="${unsubscribeUrl}" style="color:#dc2626;">cancelar tu suscripción</a>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f8f8fa;padding:20px 30px;text-align:center;">
              <p style="color:#999999;font-size:11px;margin:0;">
                © ${new Date().getFullYear()} Diario Noticia. Todos los derechos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function newsletterEmailTemplate(
  subject: string,
  htmlContent: string,
  previewText: string,
  unsubscribeUrl: string,
): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="background-color:#dc2626;padding:30px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:28px;">Diario Noticia</h1>
            </td>
          </tr>
          ${previewText ? `<tr><td style="padding:0;"><p style="color:#999;font-size:13px;margin:0;padding:15px 30px;background:#f8f8fa;">${previewText}</p></td></tr>` : ''}
          <tr>
            <td style="padding:40px 30px;">
              <h2 style="color:#1a1a2e;margin:0 0 20px;font-size:22px;">${subject}</h2>
              <div style="color:#4a4a68;font-size:16px;line-height:1.6;">
                ${htmlContent}
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f8f8fa;padding:20px 30px;text-align:center;">
              <p style="color:#999999;font-size:12px;line-height:1.5;margin:0;">
                <a href="${unsubscribeUrl}" style="color:#dc2626;">Cancelar suscripción</a>
              </p>
              <p style="color:#999999;font-size:11px;line-height:1.5;margin:5px 0 0;">
                © ${new Date().getFullYear()} Diario Noticia. Todos los derechos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function weeklyDigestTemplate(
  articles: Array<{ title: string; excerpt: string; slug: string; category?: string }>,
  baseUrl: string,
  unsubscribeUrl: string,
): string {
  const articleRows = articles
    .map(
      (a) => `
      <tr>
        <td style="padding:15px 0;border-bottom:1px solid #f0f0f0;">
          ${a.category ? `<p style="color:#dc2626;font-size:12px;margin:0 0 5px;text-transform:uppercase;font-weight:bold;">${a.category}</p>` : ''}
          <h3 style="color:#1a1a2e;margin:0 0 8px;font-size:17px;">
            <a href="${baseUrl}/articulo/${a.slug}" style="color:#1a1a2e;text-decoration:none;">${a.title}</a>
          </h3>
          <p style="color:#6b7280;font-size:14px;line-height:1.5;margin:0;">${a.excerpt || ''}</p>
        </td>
      </tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="background-color:#dc2626;padding:30px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:28px;">Diario Noticia</h1>
              <p style="color:#fecaca;margin:10px 0 0;font-size:14px;">Resumen semanal</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 30px;">
              <h2 style="color:#1a1a2e;margin:0 0 20px;font-size:22px;">Noticias de la semana</h2>
              <p style="color:#4a4a68;font-size:16px;line-height:1.6;margin:0 0 20px;">
                Estas son las noticias más importantes de esta semana:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${articleRows}
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f8f8fa;padding:20px 30px;text-align:center;">
              <p style="color:#999999;font-size:12px;line-height:1.5;margin:0;">
                <a href="${unsubscribeUrl}" style="color:#dc2626;">Cancelar suscripción</a>
              </p>
              <p style="color:#999999;font-size:11px;line-height:1.5;margin:5px 0 0;">
                © ${new Date().getFullYear()} Diario Noticia. Todos los derechos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
