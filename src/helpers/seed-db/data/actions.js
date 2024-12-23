export const actions = [
  {
    code: 'SAM1',
    description:
      'Assess soil, test soil organic matter and produce a soil management plan',
    payment: {
      amountPerHectare: 5.8,
      additionalPaymentPerAgreement: 95
    },
    eligibilityRules: [
      { id: 'is-below-moorland-line' },
      { id: 'is-for-whole-parcel-area' }
    ]
  },
  {
    code: 'SAM2',
    description: 'Multi-species winter cover crop',
    payment: {
      amountPerHectare: 129
    },
    eligibilityRules: [{ id: 'is-below-moorland-line' }]
  },
  {
    code: 'SAM3',
    description: 'Herbal leys',
    payment: {
      amountPerHectare: 382
    },
    eligibilityRules: [{ id: 'is-below-moorland-line' }]
  },
  {
    code: 'LIG1',
    description:
      'Manage grassland with very low nutrient inputs (outside SDAs)',
    payment: {
      amountPerHectare: 151
    },
    eligibilityRules: [{ id: 'is-outside-sda' }]
  },
  {
    code: 'LIG2',
    description: 'Manage grassland with very low nutrient inputs (SDAs)',
    payment: {
      amountPerHectare: 151
    },
    eligibilityRules: [{ id: 'is-inside-sda' }]
  },
  {
    code: 'AB3',
    description: 'Beetle banks',
    payment: {
      amountPerHectare: 573
    },
    eligibilityRules: [{ id: 'is-below-moorland-line' }]
  },
  {
    code: 'GRH7',
    description: 'Haymaking supplement',
    payment: {
      amountPerHectare: 157
    },
    eligibilityRules: [
      {
        id: 'supplement-area-matches-parent',
        config: { baseActions: ['CLIG3', 'LIG1', 'LIG2', 'GRH6'] }
      }
    ]
  },
  {
    code: 'GRH1',
    description: 'Manage rough grazing for birds',
    payment: {
      amountPerHectare: 121.0
    },
    eligibilityRules: [{ id: 'has-min-parcel-area', config: { minArea: 2 } }]
  },
  {
    code: 'CSAM1',
    description:
      'Assess soil, produce a soil management plan and test soil organic matter',
    payment: {
      amountPerHectare: 6,
      additionalPaymentPerAgreement: 97
    },
    eligibilityRules: [
      { id: 'is-below-moorland-line' },
      { id: 'is-for-whole-parcel-area' }
    ]
  },
  {
    code: 'CSAM2',
    description: 'Multi-species winter cover crop',
    payment: {
      amountPerHectare: 129
    },
    eligibilityRules: [{ id: 'is-below-moorland-line' }]
  },
  {
    code: 'CSAM3',
    description: 'Herbal leys',
    payment: {
      amountPerHectare: 382
    },
    eligibilityRules: [{ id: 'is-below-moorland-line' }]
  },
  {
    code: 'CLIG3',
    description: 'Manage grassland with very low nutrient inputs',
    payment: {
      amountPerHectare: 151
    },
    eligibilityRules: [
      { id: 'is-below-moorland-line' },
      {
        id: 'total-area-with-exception',
        config: { incompatibleAction: 'CIGL1' }
      }
    ]
  }
]
