/* hacknet.js - 5.6 GB - purchases nodes and upgrades them until the highest gain rate increase per cost ratio of the possible upgrades are below a given threshold. TODO:
* Link ratio to time to break-even
*/

import {
  string_sanitise,
  object_parse_arguments
} from "lib_no_ns.js";

const object_get_constants = function () {
  return {
    // default values
    object_defaults: {
      // time period used for checking the time in seconds
      float_sleep_duration_seconds: 1,
      // minimum gain rate increase per cost ratio threshold before the script is killed
      float_minimum_ratio: 0.0005,
    },
    object_argument_names: {
      delay: {
        short: "d",
        long: "delay",
      },
      help: {
        short: "h",
        long: "help",
      },
      ratio: {
        short: "r",
        long: "ratio",
      },
    }
  };
};

const void_print_help = function (ns) {
  const 
    object_defaults = object_get_constants().object_defaults,
    object_argument_names = object_get_constants().object_argument_names;
  ns.tprint(
    string_sanitise(`
DESCRIPTION
  Buys Hacknet nodes and upgrades them until the highest gain rate increase per cost ratio of the possible upgrades are below a given threshold.

USAGE
  run ${ns.getScriptName()} [FLAGS ...] [OPTIONS ...]

FLAGS
  -${object_argument_names.help.short}, --${object_argument_names.help.long}
    Displays this message then exits.
  
OPTIONS
  -${object_argument_names.delay.short}, --${object_argument_names.delay.long} <SECONDS>
    SECONDS = The duration of delay between each loop iteration, in seconds. Should be a floating-point number >= 0.001. Defaults to ${object_defaults.float_sleep_duration_seconds}.

  -${object_argument_names.ratio.short}, --${object_argument_names.ratio.long} <FLOAT>
    FLOAT = A value used in determining if the script should continue buying new Hacknet nodes/upgrades for these. Should be a floating point number >= 0. Higher values indicates a greater threshold so less upgrades/new nodes will be bought. Defaults to ${object_defaults.float_minimum_ratio}.`
    )
  );
};

// Adapted from updateMoneyGainRate function in the src/Hacknet/HacknetNode.ts file
const float_get_gain_rate = function (
  level,
  ram,
  cores
) {
  return level * Math.pow(1.035, ram - 1) * (cores + 5);
};

const float_get_gain_rate_increase_cost_ratio = function (
  ns,
  integer_node,
  level,
  ram,
  cores
) {
  const object_node_stats = ns.hacknet.getNodeStats(integer_node);
  return (
    float_get_gain_rate(
      object_node_stats.level + level,
      object_node_stats.ram + ram,
      object_node_stats.cores + cores
    ) -
    float_get_gain_rate(
      object_node_stats.level,
      object_node_stats.ram,
      object_node_stats.cores
    )
  ) /
  (
    ns.hacknet.getLevelUpgradeCost(
      integer_node,
      level
    ) +
    ns.hacknet.getRamUpgradeCost(
      integer_node,
      ram
    ) +
    ns.hacknet.getCoreUpgradeCost(
      integer_node,
      cores
    )
  );
};

export const main = async function (ns) {
  // variables
  const
    // defaults
    object_defaults = object_get_constants().object_defaults,
    // argument names
    object_argument_names = object_get_constants().object_argument_names;
  let
    float_sleep_duration_seconds = object_defaults.float_sleep_duration_seconds,
    float_minimum_ratio = object_defaults.float_minimum_ratio,
    // whether to display help and exit
    boolean_print_help = !1;
  // argument parsing
  const object_arguments = object_parse_arguments(ns.args);
  for (const string_argument in object_arguments)
    if (object_arguments.hasOwnProperty(string_argument)) {
      const argument_value = object_arguments[string_argument];
      switch (string_argument) {
        case object_argument_names.delay.short:
        // fall-through
        case object_argument_names.delay.long:
          float_sleep_duration_seconds = argument_value;
          break;
        case object_argument_names.help.short:
        // fall-through
        case object_argument_names.help.long:
          boolean_print_help = argument_value;
          break;
        case object_argument_names.ratio.short:
        // fall-through
        case object_argument_names.ratio.long:
          float_minimum_ratio = argument_value;
          break;
        case "_":
          continue;
        default:
          const string_message_error = `Unknown argument passed: "${string_argument}".`;
          throw (ns.tprint(`ERROR: ${string_message_error}`), new Error(string_message_error));
      }
    }

  // main
  if (boolean_print_help)
    return void_print_help(ns);
  const float_period_check = 1e3 * float_sleep_duration_seconds;
  for (
    ;
    ns.hacknet.numNodes() <= 0;

  ) {
    if (ns.hacknet.purchaseNode() === -1) {
      await ns.sleep(float_period_check);
    }
  }
  for (
    ;
    ;

  ) {
    const
      integer_nodes = ns.hacknet.numNodes(),
      object_upgrade = {
        float_gain_rate_increase_cost_ratio: float_get_gain_rate(
          1,
          1,
          1
        ) /
        ns.hacknet.getPurchaseNodeCost(),
        void_upgrade: function () {
          return ns.hacknet.purchaseNode();
        }
      };
    for (
      let integer_index_nodes = 0;
      integer_index_nodes < integer_nodes;
      ++integer_index_nodes
    ) {
      const
        float_ratio_level = float_get_gain_rate_increase_cost_ratio(
          ns,
          integer_index_nodes,
          1,
          0,
          0
        ),
        float_ratio_ram = float_get_gain_rate_increase_cost_ratio(
          ns,
          integer_index_nodes,
          0,
          1,
          0
        ),
        float_ratio_cores = float_get_gain_rate_increase_cost_ratio(
          ns,
          integer_index_nodes,
          0,
          0,
          1
        );
      if (float_ratio_level > object_upgrade.float_gain_rate_increase_cost_ratio) {
        object_upgrade.float_gain_rate_increase_cost_ratio = float_ratio_level;
        object_upgrade.void_upgrade = function () {
          ns.hacknet.upgradeLevel(integer_index_nodes, 1);
        };
      }
      if (float_ratio_ram > object_upgrade.float_gain_rate_increase_cost_ratio) {
        object_upgrade.float_gain_rate_increase_cost_ratio = float_ratio_ram;
        object_upgrade.void_upgrade = function () {
          ns.hacknet.upgradeRam(integer_index_nodes, 1);
        };
      }
      if (float_ratio_cores > object_upgrade.float_gain_rate_increase_cost_ratio) {
        object_upgrade.float_gain_rate_increase_cost_ratio = float_ratio_cores;
        object_upgrade.void_upgrade = function () {
          ns.hacknet.upgradeCore(integer_index_nodes, 1);
        };
      }
    }
    if (object_upgrade.float_gain_rate_increase_cost_ratio >= float_minimum_ratio) {
      object_upgrade.void_upgrade();
    } else {
      break;
    }
    await ns.sleep(float_period_check);
  }
};