import {AuthState} from "src/util/types";

export function storeAuthentication(state: AuthState, authentication: AuthState) {
  state.jwtToken = authentication.jwtToken || "";
  state.username = authentication.username || "anonymous";
  state.grants = authentication.grants || [];
}
