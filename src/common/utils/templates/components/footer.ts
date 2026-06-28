export function getFooterComponent() : string {
	return `
				</div>
				<div class="footer">
					<p>&copy; ${ new Date().getFullYear() } GlobalCet. Todos los derechos reservados.</p>
				</div>
			</div>
		</body>
		</html>
	`;
}
