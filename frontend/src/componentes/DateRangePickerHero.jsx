import React, { useState, useEffect } from "react";
import { DateRange } from "react-date-range";
import { addDays, format } from "date-fns";
import { es } from "date-fns/locale";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

/*
    Props:
    - onChangeRange({ Fecha_Recogida: 'yyyy-mm-dd', Fecha_Devolucion: 'yyyy-mm-dd' })
    - initialStart (opcional) 'yyyy-mm-dd'
    - initialEnd (opcional) 'yyyy-mm-dd'
    - quickRangeDays (opcional) defecto 7 (rango por defecto)
    - months (opcional) defecto 2 (número de meses a mostrar)
*/
export default function DateRangePickerHero({
    onChangeRange,
    initialStart = null,
    initialEnd = null,
    quickRangeDays = 7,
    months = 2,
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
        <div className="date-range-picker-container">
            <DateRange
                editableDateInputs={true}
                onChange={handleChange}
                moveRangeOnFirstSelection={false}
                ranges={range}
                minDate={new Date()}
                months={months}
                direction="horizontal"
                locale={es}
                rangeColors={["#6d28d9"]}
                showDateDisplay={false}
            />
            <div className="date-range-summary">
                <div className="date-item">
                    <span className="date-label">📅 Recogida</span>
                    <strong className="date-value">{format(range[0].startDate, "dd MMM yyyy", { locale: es })}</strong>
                </div>
                <div className="date-separator">→</div>
                <div className="date-item">
                    <span className="date-label">📅 Devolución</span>
                    <strong className="date-value">{format(range[0].endDate, "dd MMM yyyy", { locale: es })}</strong>
                </div>
            </div>
            {error && <div className="date-error">{error}</div>}
            
            <style>{`
                .date-range-picker-container {
                    background: #fff;
                    border-radius: 16px;
                    padding: 20px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                    border: 1px solid #e5e7eb;
                }
                
                .date-range-picker-container .rdrCalendarWrapper {
                    font-size: 14px;
                    width: 100%;
                }
                
                .date-range-picker-container .rdrMonths {
                    display: flex;
                    gap: 20px;
                }
                
                .date-range-picker-container .rdrMonth {
                    width: 300px;
                }
                
                .date-range-picker-container .rdrDayNumber span {
                    font-weight: 500;
                }
                
                .date-range-picker-container .rdrDayToday .rdrDayNumber span:after {
                    background: #6d28d9;
                }
                
                .date-range-summary {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 20px;
                    padding: 16px;
                    background: linear-gradient(135deg, #f8f4ff 0%, #ede9fe 100%);
                    border-radius: 12px;
                    margin-top: 12px;
                }
                
                .date-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                }
                
                .date-label {
                    font-size: 12px;
                    color: #6b7280;
                }
                
                .date-value {
                    font-size: 16px;
                    color: #0f172a;
                }
                
                .date-separator {
                    font-size: 20px;
                    color: #6d28d9;
                    font-weight: bold;
                }
                
                .date-error {
                    color: #dc2626;
                    font-size: 13px;
                    margin-top: 8px;
                    padding: 8px 12px;
                    background: #fef2f2;
                    border-radius: 8px;
                    border: 1px solid #fecaca;
                }
                
                @media (max-width: 700px) {
                    .date-range-picker-container .rdrMonths {
                        flex-direction: column;
                    }
                    .date-range-picker-container .rdrMonth {
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
}
