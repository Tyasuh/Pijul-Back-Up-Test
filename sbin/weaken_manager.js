// weaken_manager.js - 4GB - continuously runs enough threads of cyclic_weaken.js to meet float_ram_fraction_for_weaken_cyclic.

import {
  array_make_schedule_script,
  void_schedule_script_runner
} from "lib_ram_script.js";

// main
export const main = async function (ns) {
  const
    float_period_check = 1e3 * ns.args[0],
    string_file = ns.args[1],
    integer_threads = ns.args[2],
    array_arguments = [ns.args[3]];
  for (;;)
    void_schedule_script_runner(
      ns,
      array_make_schedule_script(ns, [
        {
          file: string_file,
          threads_or_ram_botnet: integer_threads,
          args: array_arguments,
        },
      ])
    ),
    await ns.sleep(float_period_check);
};