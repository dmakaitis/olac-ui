import state from './state'
import * as getters from './getters'
import * as mutations from './mutations'
// import * as actions from './actions'
import {Module} from "vuex"
import {AuthState} from "src/util/types";

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  // actions
} as Module<AuthState, any>
