import { TrackerTestPanel } from "@/components/TrackerTestPanel";

export default function TrackerTest() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Teste de Rastreadores</h1>
        <p className="text-muted-foreground mt-1">Teste e valide o funcionamento dos dispositivos</p>
      </div>

      <TrackerTestPanel />
    </div>
  );
}
