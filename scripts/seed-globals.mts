import { getPayload } from "payload";

function loadEnvIfPresent(path: string) {
  try {
    process.loadEnvFile?.(path);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return;
    }

    throw error;
  }
}

async function seedGlobals() {
  loadEnvIfPresent(".env.local");
  loadEnvIfPresent(".env");

  const { default: config } = await import("./payload.seed-config.mts");
  const payload = await getPayload({ config });

  console.log("Seeding globals...");

  // Seed SiteSettings
  try {
    await payload.updateGlobal({
      slug: "siteSettings",
      data: {
        navItems: [
          { label: "Work", href: "/work", openInNewTab: false },
          { label: "Services", href: "/services", openInNewTab: false },
          { label: "About", href: "/about", openInNewTab: false },
          { label: "Stories", href: "/work", openInNewTab: false },
          { label: "Product", href: "/product", openInNewTab: false },
        ],
        quoteTriggerLabel: "Get Quote",
        mobileMenuLabel: "Menu",
        storiesHref: "/work",
        showQuoteCtaRules: {
          hideOnWork: true,
          hideOnServices: true,
          hideOnAbout: true,
          hideOnProduct: true,
          hideOnProjects: false,
        },
        contactCards: [
          {
            label: "Want to collaborate?",
            sublabel: "Work with us",
            value: "newbusiness@hellomonday.com",
            href: "mailto:newbusiness@hellomonday.com",
            copyToClipboard: true,
          },
          {
            label: "Want to say hi?",
            sublabel: "General inquiries",
            value: "hello@hellomonday.com",
            href: "mailto:hello@hellomonday.com",
            copyToClipboard: true,
          },
          {
            label: "Want to join us?",
            sublabel: "Become a Mondayteer",
            value: "Apply here",
            href: "#careers",
            copyToClipboard: false,
          },
          {
            label: "Want to learn?",
            sublabel: "Become an intern",
            value: "Apply here",
            href: "#careers",
            copyToClipboard: false,
          },
        ],
        locations: [
          {
            city: "New York",
            addressLines: [
              { line: "36 East 20th St, 6th Floor" },
              { line: "New York, NY 10003" },
              { line: "Tel: +1 917 818-4282" },
            ],
            href: "https://www.google.com/maps/place/Hello+Monday/",
          },
          {
            city: "Copenhagen",
            addressLines: [
              { line: "Langebrogade 6E, 2nd floor" },
              { line: "1411 Copenhagen" },
              { line: "Tel: +45 3145 6035" },
            ],
            href: "https://www.google.com/maps/place/Hello+Monday/",
          },
          {
            city: "Aarhus",
            addressLines: [
              { line: "Banegardspladsen 20A, 1.TV" },
              { line: "8000 Aarhus C" },
              { line: "Tel: +45 6015 4515" },
            ],
            href: "https://www.google.com/maps/place/Hello+Monday/",
          },
          {
            city: "Amsterdam",
            addressLines: [
              { line: "Generaal Vetterstraat 66" },
              { line: "1059 BW Amsterdam" },
              { line: "Netherlands" },
            ],
            href: "https://www.google.com/maps/place/",
          },
        ],
        socialLinks: [
          { label: "LinkedIn", href: "https://linkedin.com" },
          { label: "Instagram", href: "https://instagram.com" },
          { label: "Twitter", href: "https://twitter.com" },
          { label: "Vimeo", href: "https://vimeo.com" },
        ],
        privacyLabel: "Global Privacy Statement",
        privacyHref: "https://www.deptagency.com/en-nl/privacy-policy/",
        backToTopLabel: "Back to top",
      },
    });
    console.log("✓ SiteSettings seeded");
  } catch (error) {
    console.error("Error seeding SiteSettings:", error);
  }

  // Seed QuoteForm
  try {
    await payload.updateGlobal({
      slug: "quoteForm",
      data: {
        triggerLabelDefault: "Get Quote",
        dialogTitle: "Get a Quote",
        dialogDescription:
          "Shape a project brief in four short steps and submit it directly to the Hello Monday team.",
        summaryHeading: "Quote Snapshot",
        summaryIntro: "Review your brief before submitting",
        submitButtonLabel: "Submit Brief",
        successMessage:
          "Quote request submitted successfully. We will get back to you soon.",
        submissionEmailRecipients: [{ email: "newbusiness@hellomonday.com" }],
        submissionEmailSubjectPrefix: "Quote Request",
        steps: [
          {
            id: "goals",
            indexLabel: "01",
            navLabel: "Goals",
            title: "Project Goals",
            description: "Choose the outcomes you want this quote to support.",
            fields: [
              {
                id: "goals",
                name: "goals",
                type: "multiSelect",
                label: "Goal Focus",
                helperText: "Select one or more outcomes for this project.",
                placeholder: "",
                required: false,
                defaultValue: "",
                includeInSummary: true,
                width: "full",
                options: [
                  { label: "Product Design", value: "Product Design" },
                  { label: "Brand Refresh", value: "Brand Refresh" },
                  { label: "Website Launch", value: "Website Launch" },
                  { label: "Campaign Experience", value: "Campaign Experience" },
                  { label: "Design System", value: "Design System" },
                ],
                validation: {},
                visibilityRules: [],
              },
              {
                id: "context",
                name: "context",
                type: "textarea",
                label: "Project Context",
                helperText: "Share the audience, challenge, or launch context behind the request.",
                placeholder: "We need a premium launch site for a new product line...",
                required: false,
                defaultValue: "",
                includeInSummary: true,
                width: "full",
                options: [],
                validation: {},
                visibilityRules: [],
              },
            ],
          },
          {
            id: "scope",
            indexLabel: "02",
            navLabel: "Scope",
            title: "Scope and Deliverables",
            description: "Define the service lanes and outputs you expect.",
            fields: [
              {
                id: "services",
                name: "services",
                type: "multiSelect",
                label: "Services",
                helperText: "Choose the service lanes you want included in the quote.",
                placeholder: "",
                required: false,
                defaultValue: "",
                includeInSummary: true,
                width: "full",
                options: [
                  { label: "Strategy", value: "Strategy" },
                  { label: "Branding", value: "Branding" },
                  { label: "Web Design", value: "Web Design" },
                  { label: "Development", value: "Development" },
                  { label: "Content", value: "Content" },
                  { label: "Motion", value: "Motion" },
                ],
                validation: {},
                visibilityRules: [],
              },
              {
                id: "deliverables",
                name: "deliverables",
                type: "multiSelect",
                label: "Deliverables",
                helperText: "Select the outputs you expect from this engagement.",
                placeholder: "",
                required: false,
                defaultValue: "",
                includeInSummary: true,
                width: "full",
                options: [
                  { label: "Landing Page", value: "Landing Page" },
                  { label: "Prototype", value: "Prototype" },
                  { label: "Visual Identity", value: "Visual Identity" },
                  { label: "Motion Toolkit", value: "Motion Toolkit" },
                  { label: "Design System", value: "Design System" },
                  { label: "Launch Assets", value: "Launch Assets" },
                ],
                validation: {},
                visibilityRules: [],
              },
            ],
          },
          {
            id: "timeline",
            indexLabel: "03",
            navLabel: "Timeline",
            title: "Timeline and Budget",
            description: "Set your expected schedule and investment range.",
            fields: [
              {
                id: "timeline",
                name: "timeline",
                type: "singleSelect",
                label: "Timeline",
                helperText: "Pick the rough delivery window you have in mind.",
                placeholder: "",
                required: false,
                defaultValue: "",
                includeInSummary: true,
                width: "half",
                options: [
                  { label: "2-3 weeks", value: "2-3 weeks" },
                  { label: "4-6 weeks", value: "4-6 weeks" },
                  { label: "6-10 weeks", value: "6-10 weeks" },
                  { label: "Flexible", value: "Flexible" },
                ],
                validation: {},
                visibilityRules: [],
              },
              {
                id: "budget",
                name: "budget",
                type: "singleSelect",
                label: "Budget Signal",
                helperText: "Optional, but useful for keeping the proposal realistic.",
                placeholder: "",
                required: false,
                defaultValue: "",
                includeInSummary: true,
                width: "half",
                options: [
                  { label: "< $5k", value: "< $5k" },
                  { label: "$5-15k", value: "$5-15k" },
                  { label: "$15-30k", value: "$15-30k" },
                  { label: "$30k+", value: "$30k+" },
                  { label: "Not sure", value: "Not sure" },
                ],
                validation: {},
                visibilityRules: [],
              },
              {
                id: "notes",
                name: "notes",
                type: "textarea",
                label: "Additional Notes",
                helperText: "Launch dates, constraints, markets, or extra notes...",
                placeholder: "Launch dates, constraints, markets, or extra notes...",
                required: false,
                defaultValue: "",
                includeInSummary: false,
                width: "full",
                options: [],
                validation: {},
                visibilityRules: [],
              },
            ],
          },
          {
            id: "contact",
            indexLabel: "04",
            navLabel: "Contact",
            title: "Contact Details",
            description: "Tell us where to send the quote and follow-up.",
            fields: [
              {
                id: "name",
                name: "name",
                type: "text",
                label: "Name",
                helperText: "",
                placeholder: "Your name",
                required: false,
                defaultValue: "",
                includeInSummary: false,
                width: "half",
                options: [],
                validation: {},
                visibilityRules: [],
              },
              {
                id: "email",
                name: "email",
                type: "email",
                label: "Email",
                helperText: "",
                placeholder: "you@company.com",
                required: true,
                defaultValue: "",
                includeInSummary: true,
                width: "half",
                options: [],
                validation: {},
                visibilityRules: [],
              },
              {
                id: "company",
                name: "company",
                type: "text",
                label: "Company",
                helperText: "",
                placeholder: "Company name",
                required: false,
                defaultValue: "",
                includeInSummary: true,
                width: "full",
                options: [],
                validation: {},
                visibilityRules: [],
              },
              {
                id: "contactMethod",
                name: "contactMethod",
                type: "radio",
                label: "Preferred Contact",
                helperText: "",
                placeholder: "",
                required: false,
                defaultValue: "",
                includeInSummary: false,
                width: "full",
                options: [
                  { label: "Email", value: "email" },
                  { label: "Phone", value: "phone" },
                  { label: "WhatsApp", value: "whatsapp" },
                ],
                validation: {},
                visibilityRules: [],
              },
            ],
          },
        ],
      },
    });
    console.log("✓ QuoteForm seeded");
  } catch (error) {
    console.error("Error seeding QuoteForm:", error);
  }

  // Seed Homepage
  try {
    const projectSeed = await payload.find({
      collection: "projects",
      depth: 0,
      limit: 3,
      sort: "sortOrder",
    });

    await payload.updateGlobal({
      slug: "homepage",
      data: {
        internalName: "Homepage",
        metaTitle: "Hello Monday / Dept.",
        metaDescription:
          "Reference-driven motion study of the Hello Monday homepage.",
        blocks: [
          {
            blockType: "hero",
            blockName: "Hero",
            anchorId: "home",
            isVisible: true,
            eyebrow: "We make digital (and magical)...",
            headlineRotator: [
              { value: "Products" },
              { value: "Branding" },
              { value: "Products" },
              { value: "Branding" },
              { value: "Experiences" },
              { value: "Branding" },
            ],
            scrollCueLabel: "Scroll to explore",
            minHeightVariant: "tall",
            overlayStyle: "light",
          },
          {
            blockType: "curatedProjects",
            blockName: "Selected Work",
            anchorId: "work",
            isVisible: true,
            eyebrow: "Selected Work",
            heading: "Same motion system, now wrapped in the Creative visual language.",
            body:
              "The layout stays editorial and kinetic, but the surfaces, color temperature, and typography now follow the softer premium theme from the reference site.",
            filterMode: "manual",
            filterLabels: [
              { label: "All" },
              { label: "Products" },
              { label: "Experiences" },
              { label: "Branding" },
            ],
            projects: projectSeed.docs.map((project) => project.id),
            emptyStateText: "Projects will appear here once editors curate the homepage selection.",
          },
          {
            blockType: "featureMedia",
            blockName: "Product Acceleration",
            anchorId: "product",
            isVisible: true,
            eyebrow: "Product Acceleration",
            heading: "A booster rocket for digital product teams",
            body:
              "We collaborate with startups and product departments around the world to invent and reinvent the products of tomorrow.",
            backgroundMediaType: "image",
            overlayStyle: "dark",
            stats: [
              {
                label: "Global Reach",
                value: "120M+",
                supportingText: "Users affected by our work",
              },
              {
                label: "Proven Impact",
                value: "23+",
                supportingText: "Dynamic case studies",
              },
              {
                label: "Client Success",
                value: "94%",
                supportingText: "Repeat business rate",
              },
            ],
            primaryCtaLabel: "Discover our methodology",
            primaryCtaHref: "/product",
          },
          {
            blockType: "faqSpotlight",
            blockName: "FAQ",
            anchorId: "faq",
            isVisible: true,
            eyebrow: "Common Inquiries",
            heading: "Curated for the curious.",
            subheading: "Answered for the committed.",
            items: [
              {
                id: "engagement",
                question: "What does a typical engagement look like?",
                answer:
                  "Most projects begin with a focused discovery sprint, then move into strategy, design, and implementation. We align around checkpoints early so the handoff is clear and launch-ready.",
                preview:
                  "A short discovery sprint, then production with clear review cadence.",
                deliverables: [
                  { label: "Discovery Notes" },
                  { label: "Roadmap" },
                  { label: "Weekly Review Rhythm" },
                ],
              },
              {
                id: "product-teams",
                question: "Do you work with product teams as well as brands?",
                answer:
                  "Yes. We support product organizations, marketing teams, and brand leads. The shape of the project changes, but the core collaboration model stays the same.",
                preview:
                  "The process adapts to both product organizations and brand teams.",
                deliverables: [
                  { label: "UX Direction" },
                  { label: "Launch System" },
                ],
              },
              {
                id: "single-scope",
                question: "Can you take on a focused scope instead of a full redesign?",
                answer:
                  "Absolutely. We can quote single-scope projects like a launch page, design system work, or a campaign experience while keeping room to expand later.",
                preview:
                  "Focused scopes are fine as long as the output is clearly defined.",
                deliverables: [
                  { label: "Scope Plan" },
                  { label: "Execution Milestones" },
                ],
              },
              {
                id: "pricing",
                question: "How do you price projects?",
                answer:
                  "We quote by scope and outcomes, not hourly tracking. Once we understand goals, timeline, and deliverables, we can put together a tighter project estimate.",
                preview:
                  "Outcome-based pricing with a clearer estimate after discovery.",
                deliverables: [
                  { label: "Proposal" },
                  { label: "Milestone Estimate" },
                ],
              },
            ],
            quoteLauncherVariant: "standard",
            quoteLauncherLabel: "Start your discovery sprint",
          },
        ],
      },
    });
    console.log("✓ Homepage seeded");
  } catch (error) {
    console.error("Error seeding Homepage:", error);
  }

  // Seed ServicesPage
  try {
    await payload.updateGlobal({
      slug: "servicesPage",
      data: {
        heroTitle: "What we do",
        heroBody:
          "We build better businesses by creating joyful digital ideas, products and experiences that connect the hearts of brands to the hearts of humans.",
        serviceSections: [
          {
            sectionId: "products",
            eyebrow: "We make (digital)",
            title: "Products",
            body: "We make better products and make products better. From design and innovation sprints to UX design sprints and marathons, we create things that work for users and brands. Our approach was agile before they called it agile, finding innovation through structured ideation, prototyping and user-testing. Over the past couple of years, we've dived deep into machine learning and AI, but always with one question in mind: how does it make life better for humans?",
            linkLabel: "View Digital Products",
            illustration: "products",
            cards: [
              {
                title: "Playful interfaces for everyday tools",
                subtitle: "Product concept",
                art: "confetti-watch",
              },
              {
                title: "A bold platform made instantly recognizable",
                subtitle: "Product launch",
                art: "youtube-play",
              },
            ],
          },
          {
            sectionId: "experiences",
            eyebrow: "We make (digital)",
            title: "Experiences",
            body: "We tell stories with images, film, 360, virtual reality, augmented reality, 3D graphics and that magical technology called language. We don't see a dividing line between 'digital' and 'real' - do it right and digital is real. Immersive, emotional, joyful, memorable, magical. We love coming up with new, meaningful ways to make a human connection.",
            linkLabel: "View Digital Experiences",
            illustration: "experiences",
            cards: [
              {
                title: "Editorial art direction with tactile framing",
                subtitle: "Immersive storytelling",
                art: "bear-frame",
              },
              {
                title: "A cinematic launch world for fans",
                subtitle: "Digital experience",
                art: "vr-fans",
              },
            ],
          },
          {
            sectionId: "branding",
            eyebrow: "We make",
            title: "Branding",
            body: "Brands are ideas that keep growing. We think of them like machine learning. When you build a brand, you build in the power to adapt and evolve. We create the building blocks: the strategy, symbol, logotype, typography, color scheme, iconography, illustration style, visuals, animations, motion design, photography style, sound design, messaging, and tone of voice. But ultimately the brand creates itself - in the minds and hearts of the audience.",
            linkLabel: "View Branding",
            illustration: "branding",
            cards: [
              {
                title: "A visual identity built from one memorable mark",
                subtitle: "Brand system",
                art: "split-rings",
              },
              {
                title: "Packaging that feels bold and gallery-like",
                subtitle: "Brand campaign",
                art: "residenta-pack",
              },
            ],
          },
        ],
        shinyThings: {
          eyebrow: "We Got",
          title: "Shiny Things",
          body: "We're supposed to say we're humbled, but we're actually proud when we win awards. They're not a perfect measure of creativity (it's about happy users, not happy judges) but they're a sign we're doing something right.",
        },
        awardColumns: [
          {
            awards: [
              { label: "Cannes Lion", value: "8" },
              { label: "D&AD", value: "5" },
              { label: "Eurobest awards", value: "2" },
              { label: "FWA SOTD\nFWA Hall of Fame", value: "121" },
            ],
          },
          {
            awards: [
              { label: "Webby Awards", value: "14" },
              { label: "Creative Circle Awards", value: "48" },
              { label: "Awwwards", value: "58" },
            ],
          },
        ],
        metaTitle: "Services | Hello Monday / Dept.",
        metaDescription:
          "We build better businesses by creating joyful digital ideas, products and experiences.",
      },
    });
    console.log("✓ ServicesPage seeded");
  } catch (error) {
    console.error("Error seeding ServicesPage:", error);
  }

  // Seed AboutPage
  try {
    await payload.updateGlobal({
      slug: "aboutPage",
      data: {
        heroTitle: "Who we are",
        heroBody:
          "HELLO MONDAY/DEPT is a creative studio that turns digital ideas into warm, memorable experiences. We mix strategy, product thinking, and playful craft so brands can feel sharper, friendlier, and more human wherever they show up.",
        codeOfHonor: {
          eyebrow: "Yes, we have a Code of Honor",
          title: "Code of Honor",
          body: "The better the collaboration, the more useful it is to be explicit about how we work together. These eight rules keep the studio kind, ambitious, honest, and fun even when the brief gets messy.",
          items: [
            {
              itemId: "be-nice",
              index: "01",
              title: "Be nice",
              body: "Curiosity travels further than ego. We assume good intent, give generous feedback, and remember that a difficult conversation can still be a respectful one.",
              art: "be-nice",
            },
            {
              itemId: "powers-for-good",
              index: "02",
              title: "Use our powers for good",
              body: "Creative work changes behavior. We would rather build ideas that help people feel more capable, more informed, or more connected than work that is only clever for five minutes.",
              art: "powers-for-good",
            },
            {
              itemId: "try-the-truth",
              index: "03",
              title: "Try the truth",
              body: "Honesty is almost always the fastest route forward. We say what is working, what is not, and what still needs proof, then use that clarity to make better decisions.",
              art: "try-the-truth",
            },
            {
              itemId: "enjoy-the-ride",
              index: "04",
              title: "Enjoy the ride",
              body: "Ambition should still leave room for delight. We celebrate progress, stay open to the unexpected, and keep enough humor in the room to survive the hard parts.",
              art: "enjoy-the-ride",
            },
            {
              itemId: "speak-up-and-listen",
              index: "05",
              title: "Speak up and listen",
              body: "Strong opinions are useful when they come with equal attention. We bring a point of view, make space for others, and stay willing to change our minds.",
              art: "speak-up-and-listen",
            },
            {
              itemId: "solve-the-problem",
              index: "06",
              title: "Solve the problem",
              body: "Pretty surfaces are not enough. We keep asking what the challenge actually is so the final idea feels clear, useful, and worth shipping.",
              art: "solve-the-problem",
            },
            {
              itemId: "help-each-other",
              index: "07",
              title: "Help each other",
              body: "The best studios feel like a team sport. We share context early, unblock each other quickly, and make time to support the work beyond our own swim lane.",
              art: "help-each-other",
            },
            {
              itemId: "team-up",
              index: "08",
              title: "Team up",
              body: "Our favorite work happens when different disciplines sharpen one another. Strategy, design, motion, writing, and technology all get better when they move together.",
              art: "team-up",
            },
          ],
        },
        mondayteers: {
          eyebrow: "We are the",
          title: "Mondayteers",
          body: "A few dummy studio portraits to make the page feel alive. Each card leans into the app's color system and keeps the editorial energy of the reference without pretending these are real team bios.",
          team: [
            {
              name: "Saskia",
              city: "Copenhagen",
              role: "Design Director",
              art: "art1",
              accentLabel: "Calm systems",
            },
            {
              name: "Fallon",
              city: "New York",
              role: "Creative Technologist",
              art: "art2",
              accentLabel: "Prototype wizardry",
            },
            {
              name: "Chelsea",
              city: "New York",
              role: "Brand Strategist",
              art: "art3",
              accentLabel: "Sharp narratives",
            },
            {
              name: "Mads",
              city: "Aarhus",
              role: "Motion Designer",
              art: "art4",
              accentLabel: "Movement studies",
            },
            {
              name: "Noor",
              city: "Copenhagen",
              role: "Experience Designer",
              art: "art5",
              accentLabel: "System thinker",
            },
            {
              name: "Elias",
              city: "Amsterdam",
              role: "Product Designer",
              art: "art6",
              accentLabel: "Interface detail",
            },
          ],
        },
        metaTitle: "About | Hello Monday / Dept.",
        metaDescription: "Who we are and what we stand for.",
      },
    });
    console.log("✓ AboutPage seeded");
  } catch (error) {
    console.error("Error seeding AboutPage:", error);
  }

  // Seed WorkPage
  try {
    await payload.updateGlobal({
      slug: "workPage",
      data: {
        heroTitle: "Work",
        heroBody: "An editorial grid of selected Hello Monday projects curated from Payload CMS.",
        metaTitle: "Work | Hello Monday / Dept.",
        metaDescription: "An editorial grid of selected Hello Monday projects.",
        filterLabels: [
          { label: "Products", value: "Products" },
          { label: "Experiences", value: "Experiences" },
          { label: "Branding", value: "Branding" },
        ],
      },
    });
    console.log("✓ WorkPage seeded");
  } catch (error) {
    console.error("Error seeding WorkPage:", error);
  }

  // Seed ProductPage
  try {
    await payload.updateGlobal({
      slug: "productPage",
      data: {
        heroVideoUrl:
          "https://videos.ctfassets.net/9uhkiji6mhey/4OVP1nwGH2c9BT5xbGeDr0/b5dcaf7807d8d76081477a652dcf0cd3/Stabilized_2.mp4",
        heroTitleLines: [
          { line: "A booster" },
          { line: "rocket for" },
          { line: "digital product" },
          { line: "teams" },
        ],
        introEyebrow: "Product",
        introParagraphs: [
          { paragraph: "Our product practice started by helping global teams refine the tools millions of people touch every day, then carried that same rigor into entirely new ideas." },
          { paragraph: "Since then we have partnered with startups and established product organizations to invent, prototype, launch, and continuously sharpen digital experiences." },
          { paragraph: "We are as comfortable turning a sketch into a lovable minimum viable release as we are pressure-testing a new opportunity, always with a human lens and a little theatre." },
        ],
        collaborations: [
          {
            name: "Google",
            projectCount: "24 projects",
            tag: "Platform ecosystems",
            summary: "A decade of work across research, maps, privacy, and family products, where the challenge was making massive systems feel simple and human.",
            videoUrl: "https://videos.ctfassets.net/9uhkiji6mhey/5bYXoYyctrYNPssf6YH2s4/2fdda839e8a270b53a448e54a3bd7eae/hm-preview-google.mp4",
          },
          {
            name: "Strava",
            projectCount: "2 projects",
            tag: "Personalized storytelling",
            summary: "Turning performance data into an emotional annual recap that made each athlete feel seen, not just measured.",
            videoUrl: "https://videos.ctfassets.net/9uhkiji6mhey/7HeBTw9zPw4N9VXvmeBiPe/6ded6576282b063e4caec3fea65d08b5/product-preview-strava.mp4",
          },
          {
            name: "YouTube",
            projectCount: "11 projects",
            tag: "Launch and optimization",
            summary: "Concepting, shipping, and refining product moments for creators and audiences inside one of the world's largest platforms.",
            videoUrl: "https://videos.ctfassets.net/9uhkiji6mhey/1NYbSaz5M0Jp9DkynZ453k/ed8799ebbbcdd31f883e72e7c12ccef4/hm-preview-youtube.mp4",
          },
        ],
        testimonials: [
          {
            body: "\"They may look gentle, but they become a wonder weapon when a company needs a bold product idea sharpened into something real.\"",
            author: "Philipp Thesen",
            role: "Senior VP of Design, Deutsche Telekom AG",
          },
          {
            body: "\"Their product instinct is remarkably sharp, and they step into a team with almost no friction at all.\"",
            author: "Andy Dahley",
            role: "Head of Product and Design",
          },
        ],
        contact: {
          heading: "Ready to Collaborate?",
          body: "We are always up for meeting new teams. If you have a product in motion, a concept that needs shape, or a launch that needs sharper direction, let's talk.",
          email: "product@hellomonday.com",
          briefLabel: "Start a product brief",
          name: "Andreas Anderskou",
          title: "Managing Partner and Head of Products",
          directEmail: "andreas@hellomonday.com",
        },
        metaTitle: "Product | Hello Monday / Dept.",
        metaDescription: "Collaboration, process, and craftsmanship in digital product design.",
      },
    });
    console.log("✓ ProductPage seeded");
  } catch (error) {
    console.error("Error seeding ProductPage:", error);
  }

  console.log("Seeding complete!");
}

seedGlobals().catch((error) => {
  console.error("Error seeding globals:", error);
  process.exit(1);
});
