export function getHeaderComponent( subtitle : string ) : string {
	return `
		<!DOCTYPE html>
		<html lang="es">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&family=Outfit:wght@500;700;800&display=swap" rel="stylesheet">
			<style>
				body {
					font-family: 'Lato', ui-sans-serif, system-ui, sans-serif;
					background-color: #f8fafc;
					color: #0f172a;
					margin: 0;
					padding: 0;
					-webkit-font-smoothing: antialiased;
				}
				.container {
					max-width: 600px;
					margin: 40px auto;
					background-color: #ffffff;
					border-radius: 16px;
					overflow: hidden;
					box-shadow: 0 4px 20px rgba(15, 23, 42, 0.05);
					border: 1px solid #e2e8f0;
				}
				.header {
					background-color: #0d1f15;
					background-image: linear-gradient(135deg, #0d1f15 0%, #065f46 100%);
					padding: 40px 32px;
					text-align: center;
					border-bottom: 4px solid #10b981;
				}
				.logo {
					font-family: 'Outfit', sans-serif;
					color: #ffffff;
					font-size: 28px;
					font-weight: 800;
					margin: 0;
					letter-spacing: -0.03em;
				}
				.logo span {
					color: #10b981;
				}
				.subtitle {
					font-family: 'Lato', sans-serif;
					color: #a7f3d0;
					font-size: 14px;
					margin: 8px 0 0 0;
					font-weight: 700;
					text-transform: uppercase;
					letter-spacing: 0.1em;
				}
				.content {
					padding: 40px 32px;
				}
				.title {
					font-family: 'Outfit', sans-serif;
					font-size: 22px;
					font-weight: 700;
					color: #0f172a;
					margin-top: 0;
					margin-bottom: 16px;
				}
				.text {
					font-size: 16px;
					line-height: 1.6;
					color: #475569;
					margin-bottom: 28px;
				}
				.info-card {
					background-color: #f1f5f9;
					border-radius: 12px;
					padding: 24px;
					margin-bottom: 32px;
					border: 1px solid #e2e8f0;
				}
				.info-table {
					width: 100%;
					border-collapse: collapse;
				}
				.info-table td {
					padding: 8px 0;
					font-size: 15px;
					border-bottom: 1px solid #e2e8f0;
				}
				.info-table tr:last-child td {
					border-bottom: none;
				}
				.info-label {
					color: #475569;
					font-weight: 500;
				}
				.info-value {
					color: #0f172a;
					font-weight: 700;
					text-align: right;
				}
				.badge-pending {
					background-color: #fef3c7;
					color: #d97706;
					padding: 4px 12px;
					border-radius: 9999px;
					font-size: 13px;
					font-weight: 700;
					text-transform: uppercase;
					display: inline-block;
				}
				.items-table {
					width: 100%;
					border-collapse: collapse;
					margin-bottom: 16px;
				}
				.items-table th {
					background-color: #f8fafc;
					color: #475569;
					font-family: 'Outfit', sans-serif;
					font-size: 12px;
					font-weight: 700;
					text-transform: uppercase;
					letter-spacing: 0.05em;
					padding: 12px 16px;
					border-bottom: 2px solid #e2e8f0;
					text-align: left;
				}
				.footer {
					background-color: #f8fafc;
					padding: 32px 24px;
					text-align: center;
					border-top: 1px solid #e2e8f0;
				}
				.footer p {
					margin: 0;
					color: #94a3b8;
					font-size: 12px;
					font-family: 'Lato', sans-serif;
				}
			</style>
		</head>
		<body>
			<div class="container">
				<div class="header">
					<h1 class="logo">GLOBAL<span>CET</span></h1>
					<p class="subtitle">${ subtitle }</p>
				</div>
				<div class="content">
	`;
}
