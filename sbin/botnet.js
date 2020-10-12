// botnet.js - 2.2GB - opens ports and nukes any unrooted servers if the player's hacking level is high enough to do so and the appropriate number of object_exploits are present
import { array_get_servers_unrooted } from "lib_root.js";

// main
export const main = async function (ns) {
  const
    float_period_check = 1e3 * ns.args[0],
    array_exploits = [
      ns.brutessh,
      ns.ftpcrack,
      ns.relaysmtp,
      ns.httpworm,
      ns.sqlinject
    ],
    array_exploits_length = array_exploits.length;
  for (;;) {
    const
      array_servers_unrooted = array_get_servers_unrooted(ns),
      array_servers_unrooted_length = array_servers_unrooted.length;
    if (0 === array_servers_unrooted_length) break;
    for (
      let integer_index_server = 0;
      integer_index_server < array_servers_unrooted_length;
      ++integer_index_server
    ) {
      const string_server_unrooted = array_servers_unrooted[integer_index_server];
      for (
        let integer_index_exploit = 0;
        integer_index_exploit < array_exploits_length;
        ++integer_index_exploit
      ) {
        try {
          array_exploits[integer_index_exploit](string_server_unrooted);
        } catch (error) {
          ns.print(JSON.stringify(error));
        }
      }
      try {
        ns.nuke(string_server_unrooted);
      } catch (error) {
        ns.print(JSON.stringify(error));
      }
    }
    await ns.sleep(float_period_check);
  }
};