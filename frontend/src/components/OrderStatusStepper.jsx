const STAGES = [
  { key: 'PENDIENTE', label: 'Pendiente' },
  { key: 'PAGADO', label: 'Pago recibido' },
  { key: 'PREPARANDO', label: 'Preparando' },
  { key: 'ENVIADO', label: 'Enviado' },
  { key: 'ENTREGADO', label: 'Entregado' }
]

const OrderStatusStepper = ({ status }) => {
  if (status === 'CANCELADO') {
    return (
      <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
        Pedido cancelado
      </div>
    )
  }

  const currentIndex = STAGES.findIndex((stage) => stage.key === status)

  return (
    <div className="flex items-center">
      {STAGES.map((stage, index) => {
        const reached = index <= currentIndex
        const isLast = index === STAGES.length - 1
        return (
          <div key={stage.key} className={`flex items-center ${isLast ? '' : 'flex-1'}`}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-3 h-3 rounded-full shrink-0 ${
                  reached ? 'bg-indigo-500' : 'bg-zinc-700'
                }`}
              />
              <span className={`text-[11px] whitespace-nowrap ${reached ? 'text-indigo-400' : 'text-zinc-500'}`}>
                {stage.label}
              </span>
            </div>
            {!isLast && (
              <div className={`h-0.5 flex-1 mx-1 -mt-4 ${index < currentIndex ? 'bg-indigo-500' : 'bg-zinc-700'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default OrderStatusStepper
