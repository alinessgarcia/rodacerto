export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">RodaCerto</h1>
      <p className="text-xl mb-8">Simulador Inteligente para Motoristas de Aplicativo</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <div className="p-6 border rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Carro Próprio</h2>
          <p>Simule os custos reais do seu veículo, incluindo depreciação e manutenção.</p>
        </div>
        
        <div className="p-6 border rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Carro Alugado</h2>
          <p>Compare se vale a pena alugar ou comprar, considerando sua rotina.</p>
        </div>
      </div>
      
      <button className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
        Começar Simulação
      </button>
    </div>
  )
}
