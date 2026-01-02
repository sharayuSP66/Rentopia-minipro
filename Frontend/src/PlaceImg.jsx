import Image from "./Image.jsx";

export default function PlaceImg({ place, index = 0, className = null }) {
  if (!place.photos?.length) {
    return (
      <div className="bg-gray-200 h-full w-full flex items-center justify-center rounded-lg">
        <span className="text-gray-400">No image</span>
      </div>
    );
  }
  if (!className) {
    className = "object-cover";
  }
  // Make sure index is within bounds
  const photoIndex = index < place.photos.length ? index : 0;
  return (
    <Image
      className={`${className} h-full w-full object-cover rounded-lg`}
      src={place.photos[photoIndex]}
      alt={place.title || "Property"}
    />
  );
}

