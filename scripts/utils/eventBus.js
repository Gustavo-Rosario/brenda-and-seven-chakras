// Cria um EventTarget global reutilizável
export const eventBus = new EventTarget();

export const mostrarDialogo = ({ color, text }, fullText, n, callback) => {
    eventBus.dispatchEvent(new CustomEvent('showDialog', {
        detail: { color, text, fullText, n, callback }
    }));
}

export const esconderDialogo = () => {
    eventBus.dispatchEvent(new Event('hideDialog'));
}

export const alterarTela = (newScreen, options) => {
    eventBus.dispatchEvent(new CustomEvent('changeScreen', {
        detail: { newScreen, options }
    }));
}