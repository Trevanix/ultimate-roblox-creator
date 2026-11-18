# Errores ya vividos

Pasaron de verdad creando un juego publicado. Léelo de un vistazo al empezar cada fase.

## Código y Studio
1. **`repeat ... until` sin tope colgó Studio.** Todo bucle que espera lleva plazo (`os.clock()` + N).
2. **Caché de módulos en Edit**: la prueba pasaba con el código viejo. Prueba con `require(m:Clone())`.
3. **Batería demasiado larga** para una llamada: lánzala con `task.spawn` y recoge el resultado después.
4. **Dos sesiones de Claude sobre el mismo Studio** se pisaron cambios. Una sola a la vez.
5. **El id de Studio cambia** al reiniciarlo: vuelve a listar los Studios abiertos antes de conectar.
6. Para cambiar código hay que estar en **Edit**, no en Play. Si la persona está jugando, pregúntale antes
   de parar.
7. Capturas de Edit en negro si la persona tiene un script abierto; tras mover la cámara para una captura,
   devuélvela a como estaba.
8. En Windows, al escribir archivos con scripts, cuidado con los finales de línea (CRLF) si una herramienta
   compara contenidos.

## Seguridad y datos
9. **Modelos gratis de la Caja de herramientas traían puertas traseras** (scripts escondidos). No los uses;
   genera las piezas (con su permiso: se crean en su cuenta) o constrúyelas. Si alguno entró, busca scripts dentro de Workspace y en los modelos.
10. **Antitrampas demasiado justo**: con el retraso de red, el servidor veía al jugador lejos de la puerta y
    la partida no empezaba en el juego publicado. Márgenes generosos.
11. **El aviso de compra del cliente daba el objeto**: un tramposo podía disparar ese aviso. Solo cuenta lo
    que confirme el servidor con Roblox.
12. **La tienda enseñaba x5 y el servidor entregaba x1** (el servidor usaba una parte de la configuración
    sin el dato del multiplicador). Prueba que pase por el `ProcessReceipt` real, no solo por la regla suelta.
13. **Un recibo procesado dos veces a la vez** podía dar el producto y además un vale. Marca los recibos «en
    curso».
14. **Datos grandes en atributos del `Player`**: ~40 KB por jugador enviados a todos. Ponlos donde solo los
    recibe su dueño.
15. **Una pieza de referencia del mapa arrastrada sin querer** movió la zona de aparición, el suelo y la caja
    de la partida. Apunta su posición y compruébala.
16. **Volver a un servidor a los pocos segundos**: el bloqueo de sesión del servidor anterior aún no se había
    soltado y el jugador entró en «hoy no se guarda». Sin pérdida, pero hay que explicarlo y probarlo.

## Interfaz
17. Iconos que no se veían: faltaba `ZIndexBehavior = Sibling`.
18. `UISizeConstraint` dentro de un `ScrollingFrame` recortaba la lista.
19. En PS5 la lista con barra se quedaba la marca y no se podía elegir nada.
20. Los símbolos ✕ ○ △ □ no existían en la letra del juego: se escribieron en palabras.
21. En el teléfono, la muesca tapaba un botón; a escala 0,9 la letra no se leía.
22. Un nombre de producto inocente lo tapó el filtro de Roblox: hubo que cambiar la palabra.

## Diseño y trabajo
23. Una cuenta atrás para comprar justo cuando el jugador perdía sus cosas: presión de venta. Se quitó.
24. Una mejora con suerte pagada con una moneda que se compra con Robux se parece a un pago al azar: enseñar la
    probabilidad y declararlo.
25. Cambios de cámara o controles «para mejorar» que a la persona no le gustaron: pregunta antes de cambiar
    cómo se siente el juego, y deja una forma de volver atrás.
26. Sesiones larguísimas: más errores y más gasto. Cerrar cada dos fases con un `CLAUDE.md` al día.
27. Objetos compartidos en un servidor de práctica: el primero se lo llevaba todo. En un tutorial, un servidor
    por jugador (servidor reservado) o objetos por jugador.
28. Viajes entre lugares (TeleportService) **no funcionan en Studio**: solo se prueban publicado.
