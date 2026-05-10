# Especificaciones: Buscador Universal Inteligente (Universal Search)

Este documento detalla los requerimientos para el futuro servicio de Búsqueda Universal, el cual permitirá buscar productos, kits y laboratorios móviles (mobile labs) desde un único endpoint. Este servicio se implementará una vez que los módulos de `Kit` y `MobileLab` estén completos.

## 1. Objetivo del Servicio
Crear un servicio independiente (`UniversalSearchService`) y un controlador asociado que centralice las búsquedas del sistema. El objetivo es que el frontend tenga un único campo de búsqueda (search bar) que pueda identificar inteligentemente qué entidad se está buscando y devolver resultados mixtos o específicos.

## 2. Comportamiento Inteligente (Detección por Regex)
El buscador debe analizar la cadena de texto ingresada por el usuario (query) y utilizar expresiones regulares para determinar si se está buscando un SKU específico de alguna de las 3 entidades principales.

### Patrones de SKU Esperados:
*   **Kits**: Comienzan obligatoriamente con el prefijo `KIT-`.
    *   *Ejemplo*: `KIT-HERR-BAS`
    *   *Regex (sugerido)*: `/^KIT-[A-Z0-9]+-[A-Z0-9]+$/`
*   **Mobile Labs**: Comienzan obligatoriamente con el prefijo `ML-`.
    *   *Ejemplo*: `ML-SUEL-V01`
    *   *Regex (sugerido)*: `/^ML-[A-Z0-9]+-[A-Z0-9]+$/`
*   **Productos (Generales)**: No tienen prefijos `KIT-` o `ML-`. Suelen tener la estructura `[CAT]-[SUBCAT]-[VAR]`.
    *   *Ejemplo*: `ELEC-MONI-24PX`
    *   *Regex (sugerido)*: `/^[A-Z0-9]+-[A-Z0-9]+-[A-Z0-9]+$/`

### Lógica de Detección:
1.  **Si el query coincide con el regex de KIT**: Buscar únicamente en la tabla de `Kit` usando el query como `sku`.
2.  **Si el query coincide con el regex de ML**: Buscar únicamente en la tabla de `MobileLab` usando el query como `sku`.
3.  **Si el query coincide con un formato de SKU de Producto**: Buscar únicamente en la tabla de `Product` usando el query como `sku` (con búsqueda parcial/inteligente `contains` o `startsWith`).
4.  **Si NO coincide con ningún formato de SKU**: Se asume que es una búsqueda por nombre. Realizar una búsqueda (por ejemplo, con `contains` e `insensitive`) en los campos `name` de las tres tablas (`Product`, `Kit`, `MobileLab`) y retornar un resultado mixto que indique a qué entidad pertenece cada registro encontrado.

## 3. Retorno de Datos
El servicio debe devolver un listado unificado (o estructurado) que especifique el tipo de entidad.

*Ejemplo de estructura de respuesta:*
```json
{
  "results": [
    {
      "type": "PRODUCT",
      "data": { "id": "...", "sku": "...", "name": "..." }
    },
    {
      "type": "KIT",
      "data": { "id": "...", "code": "...", "name": "..." }
    }
  ]
}
```

## 4. Notas de Implementación
*   Se deberá considerar la paginación global si las consultas mixtas generan demasiados resultados (o utilizar limitadores de resultados, ej: máximo 10 por entidad).
*   Se podría considerar el uso de una vista materializada (Materialized View) en PostgreSQL en el futuro, o Full Text Search si el volumen de datos crece considerablemente, pero para MVP, múltiples consultas asíncronas (`Promise.all()`) sobre las tablas con filtros `contains` será suficiente.
