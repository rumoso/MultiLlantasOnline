# Endpoint: Obtener Saldo Inicial Sugerido

## Descripción
Este endpoint permite obtener una sugerencia automática del saldo inicial para una caja basado en el último corte de caja realizado. Calcula el dinero no retirado (efectivo contado - retiro por corte) del último corte cerrado.

## Información del Endpoint

**Método:** `GET`  
**URL:** `/api/cortescaja/saldo-inicial/:idSucursal/:idcajas`

### Parámetros de ruta
- `idSucursal` (number, requerido): ID de la sucursal
- `idcajas` (number, requerido): ID de la caja

### Validaciones
- Ambos parámetros deben ser números válidos
- Ambos parámetros son obligatorios

## Ejemplos de uso

### Servicio Angular/TypeScript
```typescript
// Definición del servicio
export class CortesCajaService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  async obtenerSaldoInicialSugerido(idSucursal: number, idcajas: number): Promise<any> {
    const url = `${this.baseUrl}/cortescaja/saldo-inicial/${idSucursal}/${idcajas}`;
    return this.http.get(url).toPromise();
  }
}

// Uso en componente
export class IniciarTurnoComponent {
  saldoSugerido: number = 0;
  mostrarSugerencia: boolean = false;
  
  constructor(private corteService: CortesCajaService) {}

  async cargarSaldoSugerido() {
    try {
      const response = await this.corteService.obtenerSaldoInicialSugerido(
        this.idSucursal, 
        this.idCajas
      );
      
      if (response.status === 0) {
        this.saldoSugerido = parseFloat(response.data.saldoInicialSugerido);
        this.mostrarSugerencia = true;
        
        // Opcional: prellenar el campo de saldo inicial
        this.formTurno.patchValue({
          saldoinicial: this.saldoSugerido
        });
      }
    } catch (error) {
      console.error('Error al obtener saldo sugerido:', error);
      this.mostrarSugerencia = false;
    }
  }

  aplicarSugerencia() {
    this.formTurno.patchValue({
      saldoinicial: this.saldoSugerido
    });
  }
}
```

### JavaScript Vanilla
```javascript
// Función para obtener saldo sugerido
async function obtenerSaldoInicialSugerido(idSucursal, idcajas) {
  try {
    const response = await fetch(`/api/cortescaja/saldo-inicial/${idSucursal}/${idcajas}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Uso
obtenerSaldoInicialSugerido(1, 5)
  .then(data => {
    if (data.status === 0) {
      console.log('Saldo sugerido:', data.data.saldoInicialSugerido);
      // Actualizar UI con el saldo sugerido
      document.getElementById('saldoInicial').value = data.data.saldoInicialSugerido;
    }
  })
  .catch(error => console.error('Error:', error));
```

### Axios
```javascript
import axios from 'axios';

const obtenerSaldoInicialSugerido = async (idSucursal, idcajas) => {
  try {
    const response = await axios.get(`/api/cortescaja/saldo-inicial/${idSucursal}/${idcajas}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener saldo sugerido:', error);
    throw error;
  }
};
```

## Estructura de respuesta

### Respuesta exitosa con corte anterior
```json
{
  "status": 0,
  "message": "Saldo inicial sugerido obtenido correctamente",
  "data": {
    "saldoInicialSugerido": "150.00",
    "ultimoCorte": {
      "idcortescaja": 123,
      "fecha": "20250122",
      "horacierre": "180000",
      "efectivocontado": "200.00",
      "retiroporcorte": "50.00"
    },
    "calculo": {
      "efectivoContado": "200.00",
      "retiroPorCorte": "50.00",
      "dineroNoRetirado": "150.00"
    }
  }
}
```

### Respuesta cuando no hay corte anterior
```json
{
  "status": 0,
  "message": "No se encontró un corte anterior para esta caja",
  "data": {
    "saldoInicialSugerido": 0,
    "ultimoCorte": null
  }
}
```

### Respuesta de error
```json
{
  "status": 2,
  "message": "Error al obtener el saldo inicial sugerido",
  "data": null
}
```

## Campos de respuesta

### data.saldoInicialSugerido
- **Tipo:** string (formato decimal con 2 decimales)
- **Descripción:** Cantidad sugerida para el saldo inicial basada en el cálculo: efectivo contado - retiro por corte

### data.ultimoCorte
- **Tipo:** object | null
- **Descripción:** Información del último corte de caja utilizado para el cálculo

#### Campos de ultimoCorte:
- `idcortescaja`: ID del corte de caja
- `fecha`: Fecha del corte (formato YYYYMMDD)
- `horacierre`: Hora de cierre (formato HHMMSS)
- `efectivocontado`: Efectivo contado en el corte
- `retiroporcorte`: Monto retirado durante el corte

### data.calculo
- **Tipo:** object
- **Descripción:** Desglose del cálculo realizado

#### Campos de calculo:
- `efectivoContado`: Efectivo contado del último corte
- `retiroPorCorte`: Retiro realizado en el último corte
- `dineroNoRetirado`: Resultado del cálculo (efectivo - retiro)

## Casos de uso

1. **Apertura de turno normal**: Mostrar el saldo sugerido al cajero para facilitar la apertura
2. **Validación de saldo**: Comparar el saldo ingresado con el sugerido para detectar discrepancias
3. **Auditoría**: Mantener trazabilidad del dinero entre cortes de caja

## Implementación en UI

### Ejemplo de template Angular
```html
<div class="saldo-inicial-container">
  <label for="saldoInicial">Saldo Inicial:</label>
  <input 
    type="number" 
    id="saldoInicial" 
    formControlName="saldoinicial"
    step="0.01"
    min="0"
  >
  
  <div *ngIf="mostrarSugerencia" class="sugerencia-container">
    <p class="sugerencia-texto">
      💡 Saldo sugerido basado en último corte: 
      <strong>${{saldoSugerido | number:'1.2-2'}}</strong>
    </p>
    <button 
      type="button" 
      class="btn-aplicar-sugerencia"
      (click)="aplicarSugerencia()"
    >
      Aplicar sugerencia
    </button>
  </div>
</div>
```

### Estilos CSS sugeridos
```css
.sugerencia-container {
  margin-top: 10px;
  padding: 10px;
  background-color: #f0f8ff;
  border: 1px solid #4CAF50;
  border-radius: 4px;
}

.sugerencia-texto {
  margin: 0 0 10px 0;
  color: #2e7d32;
}

.btn-aplicar-sugerencia {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 3px;
  cursor: pointer;
}

.btn-aplicar-sugerencia:hover {
  background-color: #45a049;
}
```

## Notas importantes

1. **Cálculo**: El saldo sugerido se calcula como: `efectivocontado - retiroporcorte`
2. **Último corte**: Solo considera cortes con estatus 'CERRADO'
3. **Sin corte anterior**: Si no existe un corte anterior, retorna 0 como sugerencia
4. **Validaciones**: Los parámetros de ruta son validados automáticamente
5. **Formato**: Todos los montos se retornan como strings con 2 decimales

## Códigos de estado

- `0`: Operación exitosa
- `1`: Error de validación o datos no encontrados
- `2`: Error interno del servidor