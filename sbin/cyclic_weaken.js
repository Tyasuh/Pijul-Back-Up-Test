export const main = async function (ns) {
  const
    float_duration_sleep = ns.args[0] * 1e3,
    // exposes document for free
    object_document = parent["document"];
  for (
    ;
    ;

  ) {
    try {
      await ns.weaken(object_document.string_server_target);
    } catch (error) {
      await ns.sleep(float_duration_sleep);
    }
    await ns.sleep(float_duration_sleep);
  }
};