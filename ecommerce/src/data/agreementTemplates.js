const agreementTemplates = [
  {
    id: 1,
    title: "Residential Rental Agreement",
    fields: ["owner_name", "tenant_name", "property_address", "rent_amount", "start_date", "end_date"],
    template: `
RESIDENTIAL RENTAL AGREEMENT

This Agreement is made between {{owner_name}} (Owner) 
and {{tenant_name}} (Tenant).

Property Address:
{{property_address}}

Rent Amount:
Rs. {{rent_amount}}

Rental Period:
From {{start_date}} to {{end_date}}

Both parties agree to the terms and conditions stated above.
`
  },
  {
    id: 2,
    title: "Commercial Rental Agreement",
    fields: ["owner_name", "business_name", "property_address", "rent_amount", "lease_term"],
    template: `
COMMERCIAL RENTAL AGREEMENT

Owner: {{owner_name}}
Business: {{business_name}}

Property:
{{property_address}}

Monthly Rent:
Rs. {{rent_amount}}

Lease Term:
{{lease_term}}

Agreement legally binding upon signature.
`
  },
  {
    id: 3,
    title: "Property Lease Agreement",
    fields: ["lessor_name", "lessee_name", "property_address", "lease_start", "lease_end"],
    template: `
PROPERTY LEASE AGREEMENT

Lessor: {{lessor_name}}
Lessee: {{lessee_name}}

Property Location:
{{property_address}}

Lease Duration:
From {{lease_start}} to {{lease_end}}

Signed and agreed by both parties.
`
  },
  {
    id: 4,
    title: "Leave & License Agreement",
    fields: ["licensor", "licensee", "property_address", "license_fee", "duration"],
    template: `
LEAVE & LICENSE AGREEMENT

Licensor: {{licensor}}
Licensee: {{licensee}}

Licensed Property:
{{property_address}}

License Fee:
Rs. {{license_fee}}

Duration:
{{duration}}

Subject to applicable local laws.
`
  },
  {
    id: 5,
    title: "Sublease Agreement",
    fields: ["original_tenant", "subtenant", "property_address", "sublease_start", "sublease_end"],
    template: `
SUBLEASE AGREEMENT

Original Tenant: {{original_tenant}}
Subtenant: {{subtenant}}

Property Address:
{{property_address}}

Sublease Period:
From {{sublease_start}} to {{sublease_end}}

Both parties acknowledge this agreement.
`
  }
];

export default agreementTemplates;