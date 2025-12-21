import React, { useState, useEffect } from "react";
import { DateRange } from "react-date-range";
import { addDays, format } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";


/*
    Props:
    - onChangeRange({ Fecha_Recogida: 'yyyy-mm-dd', Fecha_Devolucion: 'yyyy-mm-dd' })
    - initialStart (opcional) 'yyyy-mm-dd'
    - initialEnd (opcional) 'yyyy-mm-dd'
    - quickRangeDays (opcional) defecto 7 (rango por defecto)
*/
export default function DateRangePickerHero({
    onChangeRange,
    initialStart = null,
    initialEnd = null,
    quickRangeDays = 7,
}) {
    const today = new Date();
    const defaultStart = initialStart ? new Date(initialStart) : today;
    const defaultEnd = initialEnd ? new Date(initialEnd) : addDays(today, quickRangeDays - 1);

    const [range, setRange] = useState([
        {
            startDate: defaultStart,
            endDate: defaultEnd,
            key: "selection",
        },
    ]);

    const [error, setError] = useState(null);

    useEffect(() => {
        // emitir la selección inicial al padre en formato yyyy-mm-dd
        if (onChangeRange) {
            onChangeRange({
                Fecha_Recogida: format(range[0].startDate, "yyyy-MM-dd"),
                Fecha_Devolucion: format(range[0].endDate, "yyyy-MM-dd"),
            });
        }
    }, []);

    function handleChange(item) {
        const s = item.selection.startDate;
        const e = item.selection.endDate;
        
        // Validaciones basicas en cliente
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        if (!s || !e) {
            setError("Selecciona un rango válido.");
        } else if (s < hoy) {
            setError("No puedes elegir fechas anteriores a hoy.");
        } else if (s >= e) {
            setError("La fecha de recogida debe ser anterior a la de devolución.");
        } else {
            setError(null);
        }

        setRange([item.selection]);
      
        if (onChangeRange) {
            onChangeRange({
            Fecha_Recogida: format(s, "yyyy-MM-dd"),
            Fecha_Devolucion: format(e, "yyyy-MM-dd"),
            });
        }
    }   

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <DateRange
                editableDateInputs={true}
                onChange={handleChange}
                moveRangeOnFirstSelection={false}
                ranges={range}
                minDate={new Date()} /* bloquea fechas pasadas */
                months={1}
                direction="horizontal"
            />
            <div style={{ fontSize: 15 }}>
                <div>
                    Desde: <strong>{format(range[0].startDate, "dd-MM-yyyy")}</strong>
                </div>
                <div>
                    Hasta: <strong>{format(range[0].endDate, "dd-MM-yyyy")}</strong>
                </div>
                {error && <div style={{ color: "#b91c1c", marginTop: 6 }}>{error}</div>}
            </div>
        </div>
    );
}
