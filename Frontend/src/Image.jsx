export default function Image({ src, ...rest }) {
  // If src is already a full URL (Cloudinary or any https), use it as-is
  // Otherwise, it's a legacy relative path that needs the server prefix
  if (src && !src.includes("https://") && !src.includes("http://")) {
    // Only prepend for legacy relative paths, not for empty or invalid src
    if (src && src.length > 5) {
      src = "https://placebooking-com.onrender.com" + src;
    }
  }
  return <img {...rest} src={src || ''} alt={""} />;
}
