import Keycloak from "keycloak-js";
import { config } from "../config/env";

const keycloak = new Keycloak({
  url: config.keycloakUrl,
  realm: config.keycloakRealm,
  clientId: config.keycloakClientId,
});

export default keycloak;
