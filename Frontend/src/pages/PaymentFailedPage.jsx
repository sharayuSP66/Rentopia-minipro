import { Link, useNavigate } from "react-router-dom";
import { FiXCircle, FiRefreshCw, FiHome, FiHelpCircle } from "react-icons/fi";

export default function PaymentFailedPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
              
                <div className="mb-8">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-4">
                        <FiXCircle className="w-12 h-12 text-red-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h1>
                    <p className="text-gray-600">
                        We couldn't process your payment. Don't worry, no charges were made to your account.
                    </p>
                </div>

                {/* Error Details Card */}
                <div className="bg-red-50 border border-red-100 rounded-2xl p-6 mb-8">
                    <h3 className="font-semibold text-red-800 mb-2">What might have happened?</h3>
                    <ul className="text-sm text-red-700 text-left space-y-2">
                        <li className="flex items-start gap-2">
                            <span className="mt-1">•</span>
                            <span>Insufficient funds in your account</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-1">•</span>
                            <span>Card declined by your bank</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-1">•</span>
                            <span>Network connectivity issues</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-1">•</span>
                            <span>Session expired during payment</span>
                        </li>
                    </ul>
                </div>

               
                <div className="space-y-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white py-3 px-6 rounded-xl font-medium transition-all shadow-md hover:shadow-lg"
                    >
                        <FiRefreshCw className="w-5 h-5" />
                        Try Again
                    </button>

                    <Link
                        to="/account/bookings"
                        className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-medium transition-all"
                    >
                        View My Bookings
                    </Link>

                    <Link
                        to="/"
                        className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 py-3 px-6 rounded-xl font-medium transition-all"
                    >
                        <FiHome className="w-5 h-5" />
                        Back to Home
                    </Link>
                </div>
 
            
                <div className="mt-8 pt-6 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                        Need help?{" "}
                        <a href="mailto:support@rentopia.com" className="text-primary hover:underline inline-flex items-center gap-1">
                            <FiHelpCircle className="w-4 h-4" />
                            Contact Support
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
