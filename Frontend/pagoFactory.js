class PagoTarjeta {
    procesarPago() {
        return 'El pago se realiza con tarjeta.';
    }
}

class PagoSinpe {
    procesarPago() {
        return 'El pago se realiza mediante SINPE Móvil.';
    }
}

class PagoEfectivo {
    procesarPago() {
        return 'El pago se realiza en la tienda.';
    }
}

// Factory Method
class CreadorPago {
    crearPago() {
        throw new Error('Debe implementar crearPago().');
    }

    procesar() {
        return this.crearPago().procesarPago();
    }
}

class CreadorPagoTarjeta extends CreadorPago {
    crearPago() {
        return new PagoTarjeta();
    }
}

class CreadorPagoSinpe extends CreadorPago {
    crearPago() {
        return new PagoSinpe();
    }
}

class CreadorPagoEfectivo extends CreadorPago {
    crearPago() {
        return new PagoEfectivo();
    }
}

// Seleccionar el creador concreto
class PagoFactory {
    static crearPago(tipo) {
        const creadores = {
            tarjeta: CreadorPagoTarjeta,
            sinpe: CreadorPagoSinpe,
            efectivo: CreadorPagoEfectivo
        };

        const Creador = creadores[tipo];

        if (!Creador) {
            throw new Error('Método de pago no válido.');
        }

        return new Creador().crearPago();
    }
}

// Strategy
function realizarPago(metodoPago) {
    return metodoPago.procesarPago();
}