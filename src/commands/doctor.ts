/**
 * This command checks the current dev environment to see if their machine is set up
 * to run Ignite properly. This needs some TLC, as it is mostly designed
 * for the old Ignite CLI and Bowser. Ignite v4 ("flame") is a combination of the two.
 */
import { GluegunToolbox } from "gluegun"
import * as os from "os"

const isWindows = process.platform === "win32"
const isMac = process.platform === "darwin"

module.exports = {
  description: "Checks your dev environment for dependencies.",
  run: async function (toolbox: GluegunToolbox) {
    // fistful of features
    const {
      filesystem: { separator },
      system: { run, which },
      print: { colors, info, table },
      strings: { padEnd },
      meta,
    } = toolbox

    // display helpers
    const column1 = (label, length = 16) => padEnd(label || "", length)
    const column2 = (label) => colors.yellow(padEnd(label || "-", 10))
    const column3 = (label) => colors.muted(label)

    // -=-=-=- system -=-=-=-
    const platform = process.platform
    const arch = os.arch()
    const cpus = os.cpus() || []
    const firstCpu = cpus[0] || { model: undefined }
    const cpu = `${firstCpu.model}`
    const cores = `${cpus.length} cores`
    const directory = `${process.cwd()}`

    info(colors.cyan("System"))
    table([
      [column1("platform"), column2(platform), column3("")],
      [column1("arch"), column2(arch), column3("")],
      [column1("cpu"), column2(cores), column3(cpu)],
      [column1("directory"), column2(directory.split(separator).pop()), column3(directory)],
    ])

    // -=-=-=- javascript -=-=-=-
    const nodePath = which("node")
    const nodeVersion = (await run("node --version", { trim: true })).replace("v", "")
    const npmPath = which("npm")
    const npmVersion = npmPath && (await run("npm --version", { trim: true }))
    let yarnPath = which("yarn")
    const yarnVersion = yarnPath && (await run("yarn --version", { trim: true }))
    yarnPath = yarnPath || "not installed"

    info("")
    info(colors.cyan("JavaScript"))
    table([
      [column1("node"), column2(nodeVersion), column3(nodePath)],
      [column1("npm"), column2(npmVersion), column3(npmPath)],
      [column1("yarn"), column2(yarnVersion), column3(yarnPath)],
    ])

    // -=-=-=- ignite -=-=-=-
    const ignitePath = which("ignite")
    const igniteSrcPath = `${meta.src}`
    const igniteVersion = meta.version()
    // const igniteJson = ignite.loadIgniteConfig()
    // const installedGenerators = runtime.commands
    //   .filter(cmd => cmd.name === "generate")
    //   .sort((a, b) => (a.commandPath.join(" ") < b.commandPath.join(" ") ? -1 : 1))
    //   .reduce((acc, k) => {
    //     k.plugin.commands.map(c => {
    //       if (c.plugin.name === k.plugin.name && k.plugin.name !== "ignite" && c.name !== "generate") {
    //         if (!acc[c.name]) {
    //           acc[c.name] = [k.plugin.name]
    //         } else {
    //           acc[c.name].push(k.plugin.name)
    //         }
    //       }
    //     })
    //     return acc
    //   }, {})
    // igniteJson.generators = Object.assign({}, installedGenerators, igniteJson.generators)

    info("")
    info(colors.cyan("Ignite"))
    const igniteTable = []
    igniteTable.push([column1("ignite-cli"), column2(igniteVersion), column3(ignitePath)])
    igniteTable.push([
      column1("ignite src"),
      column2(igniteSrcPath.split(separator).pop()),
      column3(igniteSrcPath),
    ])
    // if (igniteJson) {
    //   Object.keys(igniteJson).forEach(k => {
    //     const v = typeof igniteJson[k] === "object" ? JSON.stringify(igniteJson[k]) : igniteJson[k]
    //     if (k === "generators") {
    //       igniteTable.push([column1(k), column2(" "), column3("")])
    //       Object.keys(igniteJson[k]).forEach(t => {
    //         const l = Array.isArray(igniteJson[k][t]) ? igniteJson[k][t].join(", ") : igniteJson[k][t]
    //         igniteTable.push([column1(""), column2(t), column3(l)])
    //       })
    //     } else {
    //       igniteTable.push([column1(k), column2(v), column3("")])
    //     }
    //   })
    // }

    table(igniteTable)

    // -=-=-=- android -=-=-=-
    const androidPath = process.env.ANDROID_HOME
    const javaPath = which("java")
    const javaVersionCmd = isWindows ? "java -version" : "java -version 2>&1"
    const javaVersion = javaPath && (await run(javaVersionCmd)).match(/"(.*)"/).slice(-1)[0]

    info("")
    info(colors.cyan("Android"))
    table([
      [column1("java"), column2(javaVersion), column3(javaPath)],
      [column1("android home"), column2("-"), column3(androidPath)],
    ])

    // -=-=-=- iOS -=-=-=-
    if (isMac) {
      const xcodePath = which("xcodebuild")
      const xcodeVersion =
        xcodePath && (await run("xcodebuild -version", { trim: true })).split(/\s/)[1]

      info("")
      info(colors.cyan("iOS"))
      table([[column1("xcode"), column2(xcodeVersion)]])

      const cocoaPodsPath = which("pod") || ""
      const cocoaPodsVersion = cocoaPodsPath
        ? await run("pod --version", { trim: true })
        : "Not installed"
      table([[column1("cocoapods"), column2(cocoaPodsVersion), column3(cocoaPodsPath)]])
    }

    // -=-=-=- windows -=-=-=-
    // TODO: what can we check on Windows?
    if (isWindows) {
      // info('')
      // info(colors.cyan('Windows'))
      // table([])
    }
  },
}
