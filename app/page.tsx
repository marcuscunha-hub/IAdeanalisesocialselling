import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
      <h1 className="text-3xl font-bold">Social Selling AI</h1>
      <p className="text-gray-400 text-center max-w-md">
        Análise de performance dos Social Sellers com base no processo de
        abordagem, qualificação, agendamento e follow-up.
      </p>
      <Link
        href="/dashboard"
        className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition"
      >
        Abrir Dashboard
      </Link>
    </main>
  );
}
