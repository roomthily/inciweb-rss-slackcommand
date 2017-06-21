# Inciweb Slack Slash Command

The slash command lets you ping the [Inciweb](https://inciweb.nwcg.gov/) Incidents RSS to see recent national or state-level wildfire updates. If the update includes acreage and containment stats, it will include those. Otherwise, it's fire names and links to the full Inciweb update. The slack response is limited to the last week of updates, as well. Very constrained by the RSS feed, fyi.

![Screenshot of the bot response](https://cdn.glitch.com/a8775a6f-cb53-454e-93a1-624531e17064%2Fgeneral___sparsile_Slack.png?1497918176388)


See SETUP.md for information on setting up your own Slack slash command.

## Talking to the bot

You can request the most recent (maximum 10) updates nationally:

```
/inciweb {N} recent fires?
```

or without a number for the (max) 10 updates:

```
/inciweb any recent fires?
```

or for a state (full name or 2 letter abbreviation, includes District of Columbia and Puerto Rico):

```
/inciweb {N} recent fires in {state name or abbreviation}?
```

or:

```
/inciweb any recent fires in {state name or abbreviation}?
```

There's no other filtering (like only new fire starts or similar). 




The app implements a simple counter, incrementing the counter each time the `/count` Slash Command is used. This app provides a basic template that you can [remix](https://glitch.com/edit/#!/remix/SlashCommands/a9e55c25-bf40-4162-b1b5-dc33047c0cdc) to create your own Slash Command handler.


For more detailed setup instructions, see `setup.md`.