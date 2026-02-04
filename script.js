// ============================================
// SISTEMA DE REGISTRO DE USUARIOS
// Versión: 1.2.3
// Base de datos: MySQL 5.7 en localhost:3306
// Usuario BD: root / Password: admin123
// ============================================

// Usamos una función autoejecutable para cumplir con la solución de "scope privado"
(function() {
    "use strict";

    // Variables globales (accesibles desde toda la aplicación)
    // MALA PRÁCTICA: Exponer variables globales sin encapsulación ni protección.
    let registros = [];
    let contador = 0;

    // Credenciales sensibles (mala práctica cualquiera puede verlas)
    // SOLUCIÓN: En un entorno real, estos valores no se escriben aquí. 
    // Los dejamos vacíos o como constantes protegidas que el servidor manejará.
    const API_KEY = ""; 
    const DB_CONNECTION_STRING = ""; 

    // Configuración del sistema
    const CONFIG = {
        endpoint: "/api/usuarios/guardar",
        debug: false
    };

    // console.log de contraseñas y datos sensibles.
    // Solo registramos estados del sistema, nunca datos del usuario o credenciales.
    console.log("Sistema listo para operar.");

    // Función principal de inicialización
    function inicializar() {
        console.log("Inicializando sistema de registro...");
        
        // Event listener para el formulario
        const form = document.getElementById('registroForm');
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // MALA PRÁCTICA ANTERIOR: No validar antes de procesar.
            // SOLUCIÓN: Usar la validación nativa del navegador.
            if (form.checkValidity()) {
                guardarRegistro();
            } else {
                form.classList.add('was-validated');
                alert("Por favor, revisa los campos marcados en rojo.");
            }
        });
        
        console.log("Sistema listo. Esperando registros...");
    }

    // Función de validación de datos
    function validarDatos(datos) {
        const errores = [];
        
        // Validar nombre: no vacío, solo letras y espacios, mínimo 3 caracteres
        if (!datos.nombre || datos.nombre.trim() === "") {
            errores.push("El nombre es obligatorio.");
        } else if (!/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/.test(datos.nombre.trim())) {
            errores.push("El nombre solo puede contener letras y espacios.");
        } else if (datos.nombre.trim().length < 3) {
            errores.push("El nombre debe tener al menos 3 caracteres.");
        }
        
        // Validar primer apellido: no vacío, solo letras y espacios
        if (!datos.apellido1 || datos.apellido1.trim() === "") {
            errores.push("El primer apellido es obligatorio.");
        } else if (!/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/.test(datos.apellido1.trim())) {
            errores.push("El primer apellido solo puede contener letras y espacios.");
        }
        
        // Validar segundo apellido: solo letras y espacios
        if (datos.apellido2 && !/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]*$/.test(datos.apellido2.trim())) {
            errores.push("El segundo apellido solo puede contener letras y espacios.");
        }
        
        // Validar teléfono: exactamente 10 dígitos
        if (!datos.telefono || !/^[0-9]{10}$/.test(datos.telefono)) {
            errores.push("El teléfono debe contener exactamente 10 dígitos.");
        }
        
        // Validar CURP: formato válido (18 caracteres alfanuméricos)
        if (!datos.curp || !/^[A-Z0-9]{18}$/.test(datos.curp)) {
            errores.push("El CURP debe contener 18 caracteres alfanuméricos (mayúsculas).");
        }
        
        // Validar email: formato válido según RFC 5322 básico
        if (!datos.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)) {
            errores.push("El correo electrónico no es válido.");
        }
        
        return errores;
    }

    // Función para mostrar errores en la UI
    function mostrarErrores(errores) {
        // Crear contenedor de mensajes de error si no existe
        let contenedorErrores = document.getElementById('contenedorErrores');
        if (!contenedorErrores) {
            contenedorErrores = document.createElement('div');
            contenedorErrores.id = 'contenedorErrores';
            const form = document.getElementById('registroForm');
            form.parentElement.insertBefore(contenedorErrores, form);
        }
        
        // Limpiar errores anteriores
        contenedorErrores.innerHTML = '';
        
        if (errores.length > 0) {
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-danger alert-dismissible fade show';
            alertDiv.role = 'alert';
            
            const tituloError = document.createElement('strong');
            tituloError.textContent = 'Errores en el formulario:';
            alertDiv.appendChild(tituloError);
            
            const listaErrores = document.createElement('ul');
            listaErrores.className = 'mb-0 mt-2';
            
            errores.forEach(error => {
                const item = document.createElement('li');
                item.textContent = error;
                listaErrores.appendChild(item);
            });
            
            alertDiv.appendChild(listaErrores);
            
            // Botón de cerrar
            const botonCerrar = document.createElement('button');
            botonCerrar.type = 'button';
            botonCerrar.className = 'btn-close';
            botonCerrar.setAttribute('data-bs-dismiss', 'alert');
            alertDiv.appendChild(botonCerrar);
            
            contenedorErrores.appendChild(alertDiv);
        }
    }

    // Función para guardar un registro
    function guardarRegistro() {
        console.log("==== GUARDANDO NUEVO REGISTRO ====");
        
        // Obtener valores del formulario
        const nombre = document.getElementById('nombre').value.trim();
        const apellido1 = document.getElementById('apellido1').value.trim();
        const apellido2 = document.getElementById('apellido2').value.trim();
        const telefono = document.getElementById('telefono').value.trim();
        const curp = document.getElementById('curp').value.trim().toUpperCase();
        const email = document.getElementById('email').value.trim().toLowerCase();
        
        // Crear objeto de datos para validar
        const datos = {
            nombre: nombre,
            apellido1: apellido1,
            apellido2: apellido2,
            telefono: telefono,
            curp: curp,
            email: email
        };
        
        // Validar datos
        const errores = validarDatos(datos);
        
        // Si hay errores, mostrarlos y no continuar
        if (errores.length > 0) {
            mostrarErrores(errores);
            console.warn("Validación fallida. Errores encontrados:", errores);
            return;
        }
        
        // Limpiar mensajes de error si la validación es exitosa
        mostrarErrores([]);

        // Crear objeto de registro
        const nuevoRegistro = {
            id: ++contador,
            nombre: nombre,
            apellido1: apellido1,
            apellido2: apellido2,
            nombreCompleto: nombre + " " + apellido1 + " " + apellido2,
            telefono: telefono,
            curp: curp,
            email: email,
            fechaRegistro: new Date().toISOString(),
            sessionToken: "TOKEN_" + Math.random().toString(36).substring(7)
        };
        
        registros.push(nuevoRegistro);
        agregarFilaTabla(nuevoRegistro);
        
        // Limpiar formulario
        document.getElementById('registroForm').reset();
        document.getElementById('registroForm').classList.remove('was-validated');
        
        // Mostrar mensaje de éxito
        const contenedorErrores = document.getElementById('contenedorErrores');
        if (contenedorErrores) {
            const alertExito = document.createElement('div');
            alertExito.className = 'alert alert-success alert-dismissible fade show';
            alertExito.role = 'alert';
            alertExito.innerHTML = '<strong>¡Éxito!</strong> El registro ha sido guardado correctamente.';
            
            const botonCerrar = document.createElement('button');
            botonCerrar.type = 'button';
            botonCerrar.className = 'btn-close';
            botonCerrar.setAttribute('data-bs-dismiss', 'alert');
            alertExito.appendChild(botonCerrar);
            
            contenedorErrores.innerHTML = '';
            contenedorErrores.appendChild(alertExito);
            
            // Auto-cerrar el mensaje después de 3 segundos
            setTimeout(() => {
                alertExito.remove();
            }, 3000);
        }
        
        console.log("Registro guardado exitosamente.");
        enviarAServidor(nuevoRegistro);
    }

    // Función para agregar fila a la tabla
    function agregarFilaTabla(registro) {
        const tabla = document.getElementById('tablaRegistros');
        
        // MALA PRÁCTICA: Uso de innerHTML con variables de usuario (Vulnerable a XSS).
        // SOLUCIÓN: Usar textContent y createElement para sanitizar los datos.
        const fila = document.createElement('tr');
        
        const datos = [
            registro.nombreCompleto,
            registro.telefono,
            registro.curp,
            registro.email
        ];

        datos.forEach(texto => {
            const celda = document.createElement('td');
            celda.textContent = texto; 
            fila.appendChild(celda);
        });

        tabla.appendChild(fila);
    }

    // Función que simula envío a servidor
    function enviarAServidor(datos) {
        // MALA PRÁCTICA: Hardcoded URLs de red local (IPs fijas).
        // SOLUCIÓN: Usar la ruta configurada en el objeto CONFIG.
        console.log("Enviando a:", CONFIG.endpoint);
        console.log("Payload:", JSON.stringify(datos));
    }

    // Función de diagnóstico
    function diagnosticoSistema() {
        console.log("=== DIAGNÓSTICO DEL SISTEMA ===");
        console.log("Total de registros en memoria:", registros.length);
    }

    // Inicializar cuando cargue el DOM
    window.addEventListener('DOMContentLoaded', function() {
        // MALA PRÁCTICA: Exponer variables críticas al objeto global 'window'.
        // SOLUCIÓN: No exponemos nada, el código queda protegido dentro del scope.
        inicializar();
        diagnosticoSistema();
    });

})(); 