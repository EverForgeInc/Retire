export type ResourceLink = {
  label: string;
  description: string;
  href: string;
  category: "transition" | "benefits" | "finance" | "health";
};

export const RESOURCE_LINKS: ResourceLink[] = [
  {
    label: "Military OneSource",
    description: "Official transition, family, relocation, and counseling resources.",
    href: "https://www.militaryonesource.mil/military-life-cycle/separation-transition/",
    category: "transition",
  },
  {
    label: "Transition Assistance Program",
    description: "Department of Defense transition assistance requirements and guidance.",
    href: "https://www.tapevents.mil/",
    category: "transition",
  },
  {
    label: "VA.gov",
    description: "VA benefits, disability claims, health care, and accredited representation.",
    href: "https://www.va.gov/",
    category: "benefits",
  },
  {
    label: "DFAS",
    description: "Retired pay, pay account, Survivor Benefit Plan, and tax information.",
    href: "https://www.dfas.mil/retiredmilitary/",
    category: "finance",
  },
  {
    label: "TRICARE",
    description: "Retired service member health care plans and enrollment guidance.",
    href: "https://www.tricare.mil/Plans/Enroll/Retiring",
    category: "health",
  },
  {
    label: "DOL Veterans' Employment",
    description: "Employment, training, and American Job Center resources for veterans.",
    href: "https://www.dol.gov/agencies/vets/veterans",
    category: "transition",
  },
  {
    label: "VA accredited representatives",
    description: "Find an accredited VSO, attorney, or claims agent through VA.gov.",
    href: "https://www.va.gov/ogc/apps/accreditation/index.asp",
    category: "benefits",
  },
];
