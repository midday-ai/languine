---
title: "Hur vi implementerade länkdelning med Dub.co"
publishedAt: "2024-04-04"
summary: "Vi har några funktioner som Tid Tracker, Rapporter och filer från Vault som våra användare delar utanför sitt företag och med det har vi ett auktoriseringslager på vår sida med hjälp av Supabase, men dessa länkar är ofta riktigt långa eftersom de inkluderar en unik token."
image: "/images/dub.png"
tag: "Ingenjörskonst"
---

Tidigare denna vecka delade [Dub.co](http://Dub.co) vår [kundberättelse](https://dub.co/customers/midday) om varför vi valde Dub som vår länkdelningsinfrastruktur.

<br />
I det här blogginlägget kommer vi att dela lite mer i detalj hur vi implementerade denna
funktionalitet.

<br />
Vi har några funktioner som Tid Tracker, Rapporter och filer från Vault som våra användare
 delar utanför sitt företag och med det har vi ett auktoriseringslager på vår
sida med hjälp av Supabase, men dessa länkar är ofta riktigt långa eftersom de inkluderar en
unik token.
<br />
Vår lösning var att implementera Dub för att generera unika korta URL:er.

<br />
### Hur vi implementerade delning för våra rapporter

<br />
![Midday - Översikt](/images/overview.png)

<br />
Om du tittar noga kan du se att vår länk ser ut så här: [https://go.midday.ai/5eYKrmV](https://go.midday.ai/5eYKrmV)

<br />
När användaren klickar på `Dela` utför vi en serveråtgärd med hjälp av biblioteket `next-safe-action`

som ser ut så här:

```typescript
const createReport = useAction(createReportAction, {
  onError: () => {
    toast({
      duration: 2500,
      variant: "error",
      title: "Något gick fel, vänligen försök igen.",
    });
  },
  onSuccess: (data) => {
    setOpen(false);

    const { id } = toast({
      title: "Rapport publicerad",
      description: "Din rapport är redo att delas.",
      variant: "success",
      footer: (
        <div className="mt-4 space-x-2 flex w-full">
          <CopyInput
            value={data.short_link}
            className="border-[#2C2C2C] w-full"
          />

          <Link href={data.short_link} onClick={() => dismiss(id)}>
            <Button>Visa</Button>
          </Link>
        </div>
      ),
    });
  },
});
```

<br />

Det fina med next-safe-action är att du får callbacks på onError och onSuccess så i det här fallet visar vi en toast baserat på callbacken.

<br />

Åtgärden är också ganska enkel, vi sparar först rapporten baserat på de aktuella parametrarna (från, till och typ) beroende på vilken typ av rapport vi skapar.

<br />
Vi sparar den i Supabase och får tillbaka ett id som vi använder för att generera vår delbara URL.

```typescript
const dub = new Dub({ projectSlug: "midday" });

export const createReportAction = action(schema, async (params) => {
  const supabase = createClient();
  const user = await getUser();

  const { data } = await supabase
    .from("reports")
    .insert({
      team_id: user.data.team_id,
      from: params.from,
      to: params.to,
      type: params.type,
      expire_at: params.expiresAt,
    })
    .select("*")
    .single();

  const link = await dub.links.create({
    url: `${params.baseUrl}/report/${data.id}`,
    rewrite: true,
    expiresAt: params.expiresAt,
  });

  const { data: linkData } = await supabase
    .from("reports")
    .update({
      link_id: link.id,
      short_link: link.shortLink,
    })
    .eq("id", data.id)
    .select("*")
    .single();

  const logsnag = await setupLogSnag();

  logsnag.track({
    event: LogEvents.OverviewReport.name,
    icon: LogEvents.OverviewReport.icon,
    channel: LogEvents.OverviewReport.channel,
  });

  return linkData;
});
```

<br />
Med kombinationen av serveråtgärder, Supabase och Dub kan vi skapa riktigt vackra
URL:er med analys ovanpå.

<br />
Du kan hitta källkoden för detta i vårt repository [här](https://github.com/midday-ai/midday/tree/main/apps/dashboard/src/actions/report).
