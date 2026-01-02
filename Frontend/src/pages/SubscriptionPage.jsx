import { useContext, useEffect, useState } from "react";
import { UserContext } from "../UserContext";
import AccountNav from "../AccountNav";
import axios from "axios";
import { Navigate } from "react-router-dom";

export default function SubscriptionPage() {
    const { user, setUser, ready } = useContext(UserContext);
    const [loading, setLoading] = useState(false);
    const [redirect, setRedirect] = useState(null);

    useEffect(() => {
        // Load Razorpay script
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
    }, []);

    if (!ready) return "Loading...";
    if (ready && !user) return <Navigate to={"/login"} />;

    const isSubscribed = user?.subscription?.status === "active" &&
        new Date(user.subscription.expiry?.$date?.$numberLong ? parseInt(user.subscription.expiry.$date.$numberLong) : user.subscription.expiry) > new Date();

    async function handleSubscribe() {
        setLoading(true);
        try {
            // 1. Create Order
            const { data: order } = await axios.post("/subscription/order");

            const options = {
                key: order.key_id, // Use key from backend response
                amount: order.amount,
                currency: order.currency,
                name: "Rentopia",
                description: "Annual Listing Subscription",
                order_id: order.id,
                handler: async function (response) {
                    try {
                        // 2. Verify Payment
                        await axios.post("/subscription/verify", {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        alert("Subscription Activated!");
                        // Refresh user profile to get new subscription status
                        // We can manually update context or just reload/redirect
                        window.location.reload();
                    } catch (error) {
                        alert("Verification failed");
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                },
                theme: {
                    color: "#F43F5E",
                },
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.on("payment.failed", function (response) {
                alert(response.error.description);
            });
            rzp1.open();
        } catch (e) {
            alert("Failed to initiate subscription");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <AccountNav />
            <div className="text-center max-w-lg mx-auto mt-10">
                <h1 className="text-3xl font-bold mb-4 text-primary">Membership Plan</h1>

                {isSubscribed ? (
                    <div className="bg-green-100 p-8 rounded-2xl border border-green-300">
                        <h2 className="text-2xl font-bold text-green-700 mb-2">Active Subscription</h2>
                        <p className="text-green-600 mb-4">You are currently subscribed to the {user.subscription.plan || 'Standard'} plan.</p>
                        <p className="text-sm text-gray-500">
                            Valid until: {new Date(user.subscription.expiry?.$date?.$numberLong ? parseInt(user.subscription.expiry.$date.$numberLong) : user.subscription.expiry).toLocaleDateString()}
                        </p>
                    </div>
                ) : (
                    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                        <div className="mb-6">
                            <span className="text-5xl font-bold">₹500</span>
                            <span className="text-gray-500">/year</span>
                        </div>

                        <ul className="text-left mb-8 space-y-3">
                            <li className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                List unlimited properties
                            </li>
                            <li className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                Priority support
                            </li>
                            <li className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                Verified Host Badge
                            </li>
                        </ul>

                        <button
                            onClick={handleSubscribe}
                            disabled={loading}
                            className="w-full bg-primary text-white py-3 rounded-full font-bold text-lg hover:bg-primary/90 transition shadow-lg"
                        >
                            {loading ? "Processing..." : "Subscribe Now"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
