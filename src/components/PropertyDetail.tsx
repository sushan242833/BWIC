// pages/properties/[id].tsx
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { contactInfo } from "@/utils/ContactInformation";
import { baseUrl } from "@/pages/api/rest_api";
import { capitalize } from "@/utils/Capitalize";

interface Property {
  id: number;
  title: string;
  categoryId: number;
  location: string;
  price: string;
  roi: string;
  status: string;
  area: string;
  areaNepali?: string;
  distanceFromHighway?: number;
  images: string[];
  description: string;
  category: {
    name: string;
  };
}

const PropertyDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const imageRef = useRef<HTMLDivElement | null>(null);

  const handleFullscreenToggle = () => {
    if (!document.fullscreenElement) {
      imageRef.current?.requestFullscreen().catch((err) => {
        console.error("Failed to enter fullscreen:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    if (id) {
      fetch(`${baseUrl}/api/properties/${id}`)
        .then(async (res) => {
          if (res.status === 404) {
            setProperty(null);
            setLoading(false);
            return;
          }
          if (!res.ok) {
            throw new Error("Failed to fetch");
          }
          const data = await res.json();
          setProperty(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch property", err);
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">
            Loading property details...
          </p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm bg-white p-10 rounded-xl shadow-lg border border-gray-200">
          <div className="mx-auto mb-6 w-24 h-24 flex items-center justify-center rounded-full bg-red-50 animate-pulse">
            <svg
              className="w-12 h-12 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            Property Not Found
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Sorry, the property you're looking for doesn't exist or may have
            been removed.
          </p>

          <button
            onClick={() => router.push("/properties")}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-colors font-semibold shadow-md mx-auto"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Properties
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "available":
        return "bg-green-100 text-green-800";
      case "sold":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          <button
            onClick={() => router.push("/")}
            className="hover:text-blue-600 transition-colors"
          >
            Home
          </button>
          <span>/</span>
          <button
            onClick={() => router.push("/properties")}
            className="hover:text-blue-600 transition-colors"
          >
            Properties
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">{property.title}</span>
        </nav>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3 leading-tight">
                {property.title}
              </h1>
              <div className="flex items-center text-gray-600">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="text-lg">{property.location}</span>
              </div>
            </div>
            <div className="flex items-center">
              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                  property.status
                )}`}
              >
                {property.status}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Image Viewer with Arrows */}
              <div className="relative h-80 lg:h-96" ref={imageRef}>
                <img
                  src={`${baseUrl}/${property.images[selectedImage]}`}
                  alt={property.title}
                  className="w-full h-full object-contain rounded-t-lg"
                />
                <div className="absolute top-4 right-4 bg-gray-400 bg-opacity-70 text-white px-3 py-1 rounded-md text-sm">
                  {selectedImage + 1} / {property.images.length}
                </div>

                {selectedImage > 0 && (
                  <button
                    onClick={() => setSelectedImage((prev) => prev - 1)}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-400 bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                )}
                {selectedImage < property.images.length - 1 && (
                  <button
                    onClick={() => setSelectedImage((prev) => prev + 1)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-400 bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                )}
                <button
                  onClick={handleFullscreenToggle}
                  className="absolute bottom-4 right-4 bg-gray-400 bg-opacity-60 hover:bg-opacity-80 text-white p-2 rounded-md"
                  title="Fullscreen"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 3H5a2 2 0 00-2 2v3m0 8v3a2 2 0 002 2h3m8-18h3a2 2 0 012 2v3m0 8v3a2 2 0 01-2 2h-3"
                    />
                  </svg>
                </button>
              </div>

              {/* Thumbnail Gallery */}
              {property.images.length > 1 && (
                <div className="p-4 bg-gray-50">
                  <div className="flex gap-3 overflow-x-auto">
                    {property.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                          selectedImage === idx
                            ? "border-blue-600"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <img
                          src={`${baseUrl}/${img}`}
                          alt={`View ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mt-8 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Property Description
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Price Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center">
                <p className="text-gray-600 font-medium mb-2 text-2xl">
                  Price <span className="text-sm">(per aana)</span>
                </p>
                <p className="text-3xl font-bold text-gray-900 mb-4">
                  NRs. {property.price}
                </p>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-blue-600 text-sm font-medium">
                    Expected ROI
                  </p>
                  <p className="text-xl font-bold text-blue-700">
                    {property.roi}%
                  </p>
                </div>
              </div>
            </div>

            {/* Property Features */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Property Details
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                      />
                    </svg>
                    Area (sq ft)
                  </span>
                  <span className="font-semibold text-gray-900">
                    {property.area}
                  </span>
                </div>

                {property.areaNepali && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 flex items-center">
                      <svg
                        className="w-4 h-4 mr-2 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                      Area (R-A-P-D)
                    </span>
                    <span className="font-semibold text-gray-900">
                      {property.areaNepali}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                    Category
                  </span>
                  <span className="font-semibold text-gray-900">
                    {capitalize(property.category?.name)}
                  </span>
                </div>

                {property.distanceFromHighway !== undefined && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 flex items-center">
                      <svg
                        className="w-4 h-4 mr-2 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      From Highway
                    </span>
                    <span className="font-semibold text-gray-900">
                      {property.distanceFromHighway}m
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Card */}
            <div className="bg-slate-800 rounded-lg shadow-md p-6 text-white">
              <h3 className="text-lg font-bold mb-3">
                Interested in this property?
              </h3>
              <p className="text-slate-300 mb-6 text-sm">
                Get in touch with our team for more information or to schedule a
                viewing.
              </p>
              <a href={`tel: ${contactInfo.phone}`}>
                <div className="space-y-3">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center cursor-pointer">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    Contact Agent
                  </button>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-12 flex justify-center">
          <button
            onClick={() => router.push("/properties")}
            className="inline-flex items-center px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm cursor-pointer"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Properties
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
