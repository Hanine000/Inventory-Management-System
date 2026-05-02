import * as Brevo from "@getbrevo/brevo";

const brevo = new Brevo.TransactionalEmailsApi();
brevo.authentications["apiKey"].apiKey = process.env.BREVO_API_KEY;

const FROM = { email: "boukhennoufa.nihan@gmail.com", name: "Lumière Admin" };

// ─── BRAND TOKENS ─────────────────────────────────────────────────────────────
const brand = {
  bgPage:        "#0a0f1e",
  bgCard:        "#0f172a",
  bgSection:     "#1e293b",
  bgRow:         "#151f32",
  borderSubtle:  "#1e293b",
  accent:        "#f43f5e",
  accentDark:    "#e11d48",
  accentMuted:   "rgba(244,63,94,0.15)",
  accentBorder:  "rgba(244,63,94,0.25)",
  textPrimary:   "#f1f5f9",
  textSecondary: "#94a3b8",
  textMuted:     "#475569",
  textAccent:    "#fb7185",
  white:         "#ffffff",
};

// ─── SHARED STYLES ────────────────────────────────────────────────────────────
const s = {
  body:        `margin:0;padding:0;background-color:${brand.bgPage};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;`,
  wrapper:     `width:100%;background-color:${brand.bgPage};padding:40px 0;`,
  container:   `max-width:600px;margin:0 auto;background-color:${brand.bgCard};border-radius:12px;overflow:hidden;border:1px solid ${brand.borderSubtle};`,
  header:      `background:linear-gradient(135deg,#1a0a0f 0%,${brand.bgCard} 60%,#1a0a15 100%);padding:32px 40px;border-bottom:1px solid ${brand.borderSubtle};`,
  logoWrap:    `display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,${brand.accent},#db2777);box-shadow:0 4px 20px rgba(244,63,94,0.35);`,
  logoSvg:     `display:block;`,
  brandName:   `margin:0;font-size:20px;font-weight:800;color:${brand.textPrimary};letter-spacing:-0.5px;line-height:1;`,
  brandSub:    `margin:3px 0 0;font-size:9px;font-weight:700;color:${brand.textAccent};letter-spacing:0.25em;text-transform:uppercase;`,
  headerTitle: `margin:20px 0 6px;font-size:22px;font-weight:700;color:${brand.textPrimary};letter-spacing:-0.3px;`,
  headerDesc:  `margin:0;font-size:13px;color:${brand.textSecondary};`,
  bodyPad:     `padding:32px 40px;`,
  greeting:    `margin:0 0 16px;font-size:15px;font-weight:600;color:${brand.textPrimary};`,
  text:        `margin:0 0 20px;font-size:14px;color:${brand.textSecondary};line-height:1.7;`,
  badgeBlue:   `display:inline-block;padding:3px 10px;background-color:rgba(99,102,241,0.15);color:#818cf8;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:0.4px;text-transform:uppercase;border:1px solid rgba(99,102,241,0.25);`,
  badgeRed:    `display:inline-block;padding:3px 10px;background-color:${brand.accentMuted};color:${brand.textAccent};border-radius:20px;font-size:11px;font-weight:700;letter-spacing:0.4px;text-transform:uppercase;border:1px solid ${brand.accentBorder};`,
  metaBox:     `background-color:${brand.bgSection};border-radius:8px;padding:0;margin:0 0 28px;overflow:hidden;border:1px solid ${brand.borderSubtle};`,
  metaLabel:   `font-size:12px;color:${brand.textMuted};font-weight:500;padding:12px 20px;`,
  metaValue:   `font-size:13px;color:${brand.textPrimary};font-weight:600;padding:12px 20px;text-align:right;`,
  metaDivider: `border:none;border-top:1px solid ${brand.borderSubtle};margin:0;`,
  table:       `width:100%;border-collapse:collapse;margin:0 0 28px;font-size:13px;border:1px solid ${brand.borderSubtle};border-radius:8px;overflow:hidden;`,
  thead:       `background-color:${brand.bgSection};`,
  th:          `padding:11px 16px;text-align:left;font-size:10px;font-weight:700;color:${brand.textMuted};text-transform:uppercase;letter-spacing:0.6px;border-bottom:1px solid ${brand.borderSubtle};`,
  thRight:     `padding:11px 16px;text-align:right;font-size:10px;font-weight:700;color:${brand.textMuted};text-transform:uppercase;letter-spacing:0.6px;border-bottom:1px solid ${brand.borderSubtle};`,
  td:          `padding:13px 16px;color:${brand.textSecondary};border-bottom:1px solid ${brand.borderSubtle};vertical-align:middle;`,
  tdRight:     `padding:13px 16px;color:${brand.textSecondary};border-bottom:1px solid ${brand.borderSubtle};vertical-align:middle;text-align:right;`,
  tdBold:      `padding:13px 16px;font-weight:600;color:${brand.textPrimary};border-bottom:1px solid ${brand.borderSubtle};`,
  totalLabel:  `padding:13px 16px;font-weight:700;color:${brand.textPrimary};font-size:14px;background-color:${brand.bgSection};`,
  totalValue:  `padding:13px 16px;font-weight:700;color:${brand.textAccent};font-size:14px;text-align:right;background-color:${brand.bgSection};`,
  ctaWrap:     `text-align:center;margin:4px 0 32px;`,
  ctaBtn:      `display:inline-block;padding:13px 36px;background:linear-gradient(135deg,${brand.accent},${brand.accentDark});color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:700;letter-spacing:0.3px;box-shadow:0 4px 16px rgba(244,63,94,0.35);`,
  divider:     `border:none;border-top:1px solid ${brand.borderSubtle};margin:0 0 24px;`,
  sectionLabel:`margin:0 0 12px;font-size:10px;font-weight:700;color:${brand.textMuted};text-transform:uppercase;letter-spacing:0.2em;`,
  footer:      `padding:24px 40px;background-color:${brand.bgPage};border-top:1px solid ${brand.borderSubtle};text-align:center;`,
  footerText:  `margin:0;font-size:11px;color:${brand.textMuted};line-height:1.7;`,
};

// ─── LOGO ─────────────────────────────────────────────────────────────────────
const logoSvg = `
<table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
  <tr>
    <td style="vertical-align:middle;padding-right:12px;">
      <div style="${s.logoWrap}">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="${s.logoSvg}">
          <path d="M12 2a5 5 0 015 5c0 2.5-1.5 4.5-3.5 5.5V14a1 1 0 01-1 1h-1a1 1 0 01-1-1v-1.5C8.5 11.5 7 9.5 7 7a5 5 0 015-5z"/>
        </svg>
      </div>
    </td>
    <td style="vertical-align:middle;">
      <p style="${s.brandName}">Lumi&#232;re</p>
      <p style="${s.brandSub}">Beauty Admin</p>
    </td>
  </tr>
</table>
`;

// ─── BASE TEMPLATE ────────────────────────────────────────────────────────────
const baseTemplate = ({ title, subtitle, body }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${title}</title>
</head>
<body style="${s.body}">
  <div style="${s.wrapper}">
    <div style="${s.container}">
      <div style="${s.header}">
        ${logoSvg}
        <h1 style="${s.headerTitle}">${title}</h1>
        <p style="${s.headerDesc}">${subtitle}</p>
      </div>
      <div style="${s.bodyPad}">
        ${body}
      </div>
      <div style="${s.footer}">
        <p style="${s.footerText}">
          Lumi&#232;re Beauty Admin &nbsp;&bull;&nbsp; Inventory Management System<br/>
          &copy; ${new Date().getFullYear()} Lumi&#232;re. All rights reserved.<br/>
          <span style="color:${brand.textMuted};">Please do not reply to this automated email.</span>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;

// ─── META BOX ─────────────────────────────────────────────────────────────────
const buildMetaBox = (rows) => `
<div style="${s.metaBox}">
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    ${rows.map(([label, value], i) => `
    <tr>
      <td style="${s.metaLabel}">${label}</td>
      <td style="${s.metaValue}">${value}</td>
    </tr>
    ${i < rows.length - 1 ? `<tr><td colspan="2"><hr style="${s.metaDivider}"/></td></tr>` : ""}
    `).join("")}
  </table>
</div>
`;

// ─── ITEMS TABLE ──────────────────────────────────────────────────────────────
const buildItemsTable = (items, totalAmount) => `
<p style="${s.sectionLabel}">Order Items</p>
<table style="${s.table}" cellpadding="0" cellspacing="0">
  <thead style="${s.thead}">
    <tr>
      <th style="${s.th}">#</th>
      <th style="${s.th}">Product</th>
      <th style="${s.thRight}">Qty</th>
      <th style="${s.thRight}">Unit Cost</th>
      <th style="${s.thRight}">Subtotal</th>
    </tr>
  </thead>
  <tbody>
    ${items.map((item, i) => `
    <tr style="background-color:${i % 2 === 0 ? brand.bgCard : brand.bgRow};">
      <td style="${s.td}">${i + 1}</td>
      <td style="${s.tdBold}">${item.productName}</td>
      <td style="${s.tdRight}">${item.quantity}</td>
      <td style="${s.tdRight}">${item.unitCost.toFixed(2)} DZD</td>
      <td style="${s.tdRight}">${item.subtotal.toFixed(2)} DZD</td>
    </tr>`).join("")}
    <tr>
      <td colspan="4" style="${s.totalLabel}">Total Amount</td>
      <td style="${s.totalValue}">${totalAmount.toFixed(2)} DZD</td>
    </tr>
  </tbody>
</table>
`;

// ─── FORMAT DATE ──────────────────────────────────────────────────────────────
const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-US", {
    year:  "numeric",
    month: "long",
    day:   "numeric",
  });

// ─── HELPER — send via Brevo ──────────────────────────────────────────────────
const sendEmail = ({ to, toName, subject, html }) =>
  brevo.sendTransacEmail({
    sender:  FROM,
    to:      [{ email: to, name: toName ?? to }],
    subject,
    htmlContent: html,
  });

// ─── SEND ORDER EMAIL ─────────────────────────────────────────────────────────
export const sendOrderEmail = async (order) => {
  const acceptUrl = `${process.env.APP_URL}/api/orders/${order._id}/accept`;

  const body = `
    <p style="${s.greeting}">Hello, ${order.supplierName}</p>
    <p style="${s.text}">
      A new purchase order has been placed through Lumi&#232;re's inventory system.
      Please review the details below and confirm your acceptance.
    </p>

    ${buildMetaBox([
      ["Order Number", `<span style="font-family:monospace;letter-spacing:0.05em;">${order.orderNumber}</span>`],
      ["Order Date",   formatDate(order.createdAt)],
      ["Status",       `<span style="${s.badgeBlue}">Pending</span>`],
      ["Total Items",  order.items.reduce((sum, i) => sum + i.quantity, 0)],
      ["Total Amount", `<span style="color:${brand.textAccent};font-weight:700;">${order.totalAmount.toFixed(2)} DZD</span>`],
    ])}

    ${buildItemsTable(order.items, order.totalAmount)}

    <div style="${s.ctaWrap}">
      <a href="${acceptUrl}" style="${s.ctaBtn}">&#10003;&nbsp; Accept Order</a>
    </div>

    <hr style="${s.divider}"/>

    <p style="${s.text}">
      If you have any questions about this order, please contact your account manager
      directly. Do not reply to this email.
    </p>
  `;

  await sendEmail({
    to:      order.supplierEmail,
    toName:  order.supplierName,
    subject: `[${order.orderNumber}] New Purchase Order — Action Required`,
    html:    baseTemplate({
      title:    "New Purchase Order",
      subtitle: `Order ${order.orderNumber} · ${formatDate(order.createdAt)}`,
      body,
    }),
  });
};

// ─── SEND CANCEL EMAIL ────────────────────────────────────────────────────────
export const sendCancelEmail = async (order) => {
  const body = `
    <p style="${s.greeting}">Hello, ${order.supplierName}</p>
    <p style="${s.text}">
      We regret to inform you that the following purchase order has been
      <strong style="color:${brand.textAccent};">cancelled</strong>.
      No further action is required on your part.
    </p>

    ${buildMetaBox([
      ["Order Number",  `<span style="font-family:monospace;letter-spacing:0.05em;">${order.orderNumber}</span>`],
      ["Original Date", formatDate(order.createdAt)],
      ["Cancelled On",  formatDate(new Date())],
      ["Status",        `<span style="${s.badgeRed}">Cancelled</span>`],
      ["Total Amount",  `${order.totalAmount.toFixed(2)} DZD`],
    ])}

    <p style="${s.text}">
      If any preparations were already made for this order, we sincerely apologize
      for the inconvenience. Please reach out to your account manager if you need
      further clarification or documentation.
    </p>

    <hr style="${s.divider}"/>

    <p style="${s.text}">
      We value our partnership with you and look forward to working together
      on future orders.
    </p>
  `;

  await sendEmail({
    to:      order.supplierEmail,
    toName:  order.supplierName,
    subject: `[${order.orderNumber}] Order Cancellation Notice`,
    html:    baseTemplate({
      title:    "Order Cancellation",
      subtitle: `Order ${order.orderNumber} has been cancelled`,
      body,
    }),
  });
};

// ─── SEND RESET EMAIL ─────────────────────────────────────────────────────────
export const sendResetEmail = async ({ email, name, resetUrl }) => {
  const body = `
    <p style="${s.greeting}">Hello, ${name}</p>
    <p style="${s.text}">
      We received a request to reset your password.
      Click the button below — this link expires in
      <strong style="color:${brand.textPrimary};">15 minutes</strong>.
    </p>

    <div style="${s.ctaWrap}">
      <a href="${resetUrl}" style="${s.ctaBtn}">Reset Password</a>
    </div>

    <hr style="${s.divider}"/>

    <p style="${s.text}">
      If you didn't request this, you can safely ignore this email.
      Your password will not be changed.
    </p>
  `;

  await sendEmail({
    to:      email,
    toName:  name,
    subject: "Reset your password",
    html:    baseTemplate({
      title:    "Password Reset",
      subtitle: "Follow the link below to set a new password",
      body,
    }),
  });
};