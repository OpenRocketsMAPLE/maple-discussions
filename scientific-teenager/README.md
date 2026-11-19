# The Scientific Teenager Discord app

This directory is the canonical deployment source for the Scientific Teenager Discord relay.

Railway builds this directory directly from GitHub. The source snapshot is split across `source.part00.b64` through `source.part06.b64`; the Dockerfile reconstructs the exact source archive and builds it with the committed lockfile.

Current behavior:
- `/science` configures the public channel where the command is run.
- The install URL requests Discord's **Mention Everyone** permission.
- One YES vote approves a proposal; NO votes do not block approval.
- Approved partner announcements are ordinary Discord messages.
- The first message contains a real `@everyone` mention.
- Original URLs are displayed and sent directly; partner delivery does not replace them with Railway tracking URLs.
- OpenRockets HQ proposal/review controls stay separate from partner-server setup.

Railway should use this directory as the service root and should not use environment-variable source bundles or startup patch scripts.
