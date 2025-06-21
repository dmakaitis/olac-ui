import {ClientConfig, ConfigState} from "../../util/types";

export function storeConfig(state: ConfigState, config: ClientConfig) {
    state.config = config || {};
}

export function setShowLogin(state: ConfigState, showLogin: boolean) {
    state.config = state.config || {};
    state.config.showLogin = showLogin;
}
