import {AuthState} from "src/util/types";

export default function (): AuthState {
  return {
    jwtToken: "",
    username: "",
    grants: []
  }
}
