// Redes.tsx: acá puse los links a las redes de Secret Sweet Maid, para usarlos en el Footer y en Contacto.
// Solo puse el Instagram oficial. (Los links de "Instagram" y "Bluesky" de la página oficial son de at-home cafe, no de Secret Sweet Maid.)
export const INSTAGRAM_URL = "https://www.instagram.com/secretsweetmaid/";
// formulario "buzón" de "Ser una Sweet Maid" (NO es una postulación oficial, así lo aclara la página)
export const BUZON_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSeUliBCFOj9_WBOIhXxNWEeSlwVpmP9erXhwCZHdCE5Owffgw/viewform";

const Redes = () => (
  <a
    href={INSTAGRAM_URL}
    target="_blank"
    rel="noopener noreferrer"
    className="font-bold text-rosa-500 underline"
    aria-label="Instagram de Secret Sweet Maid (se abre en otra pestaña)"
  >
    Instagram @secretsweetmaid
  </a>
);

export default Redes;
