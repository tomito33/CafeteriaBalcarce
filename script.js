// =========================================================
// 1. CONFIGURACIÓN: Pegá acá tu link CSV de Google Sheets
// =========================================================
const URL_GOOGLE_SHEET = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRjdvWeCjVmyzvueJ0MO0XIfR76kRhG_ne4Y1WiELHt6xVRuEgeL9tyo2Gb3-ZouvWhysHxO9snwc1V/pub?output=csv";

// =========================================================
// 2. LÓGICA DE CONEXIÓN Y PROCESAMIENTO (NO TOCAR)
// =========================================================

// Esta función va a internet y trae los datos de tu Excel
// Esta función va a internet y trae los datos de tu Excel
const cargarMenuDesdeGoogle = () => {
    // MAGIA: Le sumamos la hora exacta al link para que Google no use su memoria caché
    const urlSinCache = URL_GOOGLE_SHEET + "&v=" + new Date().getTime();

    Papa.parse(urlSinCache, {
        download: true,
        header: true, 
        complete: function(resultados) {
            agruparYRenderizar(resultados.data);
        }
    });
};

// Esta función organiza las filas del Excel por categorías
const agruparYRenderizar = (datosExcel) => {
    const menuAgrupado = {};

    datosExcel.forEach(fila => {
        // Si la fila está vacía, la saltea
        if (!fila.Categoria || !fila.Nombre) return;

        // Si la categoría no existe todavía, la crea
        if (!menuAgrupado[fila.Categoria]) {
            menuAgrupado[fila.Categoria] = {
                categoria: fila.Categoria,
                productos: []
            };
        }

        // Guarda el producto en su categoría correspondiente
        menuAgrupado[fila.Categoria].productos.push({
            nombre: fila.Nombre,
            descripcion: fila.Descripcion,
            precio: Number(fila.Precio), // Convierte el texto en número
            imagen: fila.Imagen
        });
    });

    // Convierte nuestro objeto en una lista y llama al dibujante
    const menuFinal = Object.values(menuAgrupado);
    renderizarMenuCompleto(menuFinal);
};

// Formateador de moneda argentina
const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(precio);
};

// Lógica del Modal (Imagen Grande)
const abrirModal = (src, nombre) => {
    const modal = document.getElementById("modal-imagen");
    const imgAmpliada = document.getElementById("img-ampliada");
    const captionTexto = document.getElementById("caption-modal");
    
    modal.style.display = "block";
    imgAmpliada.src = src;
    captionTexto.innerHTML = "" + nombre + "";
};

// Renderizado visual en la pantalla
const renderizarMenuCompleto = (menuCompleto) => {
    const contenedorMenu = document.getElementById('contenedor-menu-completo');
    const navCategorias = document.getElementById('nav-categorias'); 
    
    contenedorMenu.innerHTML = ''; 
    navCategorias.innerHTML = ''; 

    menuCompleto.forEach(seccion => {
        if (seccion.productos.length > 0) {
            
            const idCategoria = "cat-" + seccion.categoria.replace(/\s+/g, '-').toLowerCase();
            navCategorias.innerHTML += `<a href="#${idCategoria}">${seccion.categoria}</a>`;

            let seccionHTML = `
                <div id="${idCategoria}" class="categoria-menu">
                    <h4 style="color: #d35400; border-bottom: 2px solid #eee; padding-bottom: 5px; margin-top: 30px;">
                        🍴 ${seccion.categoria}
                    </h4>
                    <ul class="menu-list">
            `;

            seccion.productos.forEach(producto => {
                let imagenHTML = '';
                if (producto.imagen && producto.imagen !== "") {
                    imagenHTML = `<img src="${producto.imagen}" alt="${producto.nombre}" class="producto-img" onclick="abrirModal('${producto.imagen}', '${producto.nombre}')">`;
                }

                seccionHTML += `
                    <li class="menu-item">
                        <div class="item-info">
                            <h5>${producto.nombre}</h5>
                            <p>${producto.descripcion}</p>
                        </div>
                        <div class="item-price">
                            ${formatearPrecio(producto.precio)}
                        </div>
                        <div class="item-img-container">
                            ${imagenHTML}
                        </div>
                    </li>
                `;
            });

            seccionHTML += `</ul></div>`;
            contenedorMenu.innerHTML += seccionHTML;
        }
    });
};

// --- EVENTOS DE INICIO ---
document.addEventListener('DOMContentLoaded', () => {
    cargarMenuDesdeGoogle(); // Ahora arranca llamando a Google
    
    // Configuración para cerrar la foto grande
    const modal = document.getElementById("modal-imagen");
    const spanCerrar = document.getElementById("cerrar-modal");
    
    if(spanCerrar) {
        spanCerrar.onclick = () => { modal.style.display = "none"; };
    }
    
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    };
});

// =========================================================
// 
//  --- EVENTOS DE INICIO Y PANTALLA DE CARGA ---
document.addEventListener('DOMContentLoaded', () => {
    cargarMenuDesdeGoogle(); // Llama a Google Sheets
    
    // Configuración para cerrar la foto grande (Modal)
    const modal = document.getElementById("modal-imagen");
    const spanCerrar = document.getElementById("cerrar-modal");
    
    if(spanCerrar) {
        spanCerrar.onclick = () => { modal.style.display = "none"; };
    }
    
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    };

    // Lógica del Loader y el contador
    const porcentajeTexto = document.getElementById('porcentaje-carga');
    const pantallaCarga = document.getElementById('pantalla-carga');
    let progreso = 0;

    // Aumenta el porcentaje de 0 a 100 a lo largo de 2.5 segundos
    const intervalo = setInterval(() => {
        progreso += 2; // Sube de a 2%
        
        if (progreso >= 100) {
            progreso = 100;
            clearInterval(intervalo);
            
            // Cuando llega a 100%, espera medio segundo y desaparece suavemente
            setTimeout(() => {
                pantallaCarga.classList.add('oculto');
                document.body.classList.remove('cargando'); // Libera el movimiento de la página
            }, 500);
        }
        
        if(porcentajeTexto) {
            porcentajeTexto.innerText = progreso + '%';
        }
    }, 50); // 50ms * 50 repeticiones = 2.5 segundos exactos
});