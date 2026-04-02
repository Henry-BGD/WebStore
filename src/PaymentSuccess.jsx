import React, { useEffect, useState } from "react";
import { CheckCircle2, Mail, Video, ArrowLeft } from "lucide-react";

export default function PaymentSuccess({ lang = "en", onBack }) {
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("payment_success_data");
      if (!raw) return;
      setPaymentData(JSON.parse(raw));
    } catch (error) {
      console.error("Failed to read payment success data:", error);
    }
  }, []);

  const isRu = lang === "ru";

  if (!paymentData) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 text-center">
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {isRu ? "Данные об оплате не найдены" : "Payment data not found"}
          </p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {isRu
              ? "Попробуйте вернуться назад."
              : "Please try going back."}
          </p>

          <button
            type="button"
            onClick={onBack}
            className="mt-5 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium border-slate-200 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800/70"
          >
            <ArrowLeft className="w-4 h-4" />
            {isRu ? "Назад" : "Back"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-3xl mx-auto py-8 sm:py-12 px-4">
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-center">
          <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3">
            <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold text-center text-slate-900 dark:text-slate-100">
          {isRu ? "Оплата подтверждена 🎉" : "Payment successful 🎉"}
        </h1>

        <p className="mt-3 text-center text-slate-700 dark:text-slate-300 leading-relaxed">
          {isRu
            ? "Ваша запись в литературный клуб подтверждена."
            : "Your literature club booking has been confirmed."}
        </p>

        <div className="mt-8 grid gap-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isRu ? "Клуб" : "Club"}
            </p>
            <p className="mt-1 text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">
              {paymentData.club_title}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isRu ? "Время" : "Time"}
            </p>
            <p className="mt-1 text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">
              {paymentData.club_time_text}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-4">
            <div className="flex items-start gap-3">
              <Video className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {isRu ? "Ссылка Zoom" : "Your Zoom link"}
                </p>
                <a
                  href={paymentData.zoom_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block break-all text-base sm:text-lg font-semibold text-blue-600 hover:underline dark:text-blue-400"
                >
                  {paymentData.zoom_link}
                </a>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-4">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-slate-600 dark:text-slate-300 mt-0.5 shrink-0" />
              <div>
                <p className="text-base text-slate-800 dark:text-slate-200">
                  {isRu
                    ? "Ссылка Zoom также отправлена на вашу почту."
                    : "Your Zoom link has also been sent to your email."}
                </p>
                {paymentData.payer_email ? (
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {paymentData.payer_email}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium border-slate-200 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800/70"
          >
            <ArrowLeft className="w-4 h-4" />
            {isRu ? "Вернуться к клубам" : "Back to club"}
          </button>
        </div>
      </div>
    </section>
  );
}
