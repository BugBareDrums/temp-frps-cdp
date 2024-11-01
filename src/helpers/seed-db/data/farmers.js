export const farmers = [
  {
    crn: '1789678903',
    firstName: 'Farmer',
    lastName: 'Sarah',
    email: 'Sarah@testnull.com',
    landlinePhone: '056712678',
    mobilePhone: '012345678',
    businesSize: 'Micro',
    numberOfEmployees: 5,
    registeredOwner: 'Farmer Sarah',
    gender: 'Female',
    address: 'Imaginary Farm Co, Suffolk, SF1 23ED',
    businessType: 'Farm',
    activity: 'Arable Farm',
    companies: [
      {
        name: 'Imaginary Farm',
        id: 'imaginary-farm',
        sbi: '908789876',
        parcels: [
          {
            id: '5351',
            sheetId: 'TQ6506',
            agreements: [],
            landUseList: [
              {
                code: 'PG01',
                area: '4.2'
              }
            ],
            attributes: {
              moorlandLineStatus: 'below'
            }
          },
          {
            id: '6202',
            sheetId: 'TR2467',
            agreements: [],
            landUseList: [
              {
                code: 'IW03',
                area: '20'
              }
            ],
            attributes: {
              moorlandLineStatus: 'below'
            }
          }
        ]
      },
      {
        name: 'Apple Farm',
        id: 'apple-farm',
        sbi: '678987809',
        parcels: []
      }
    ]
  },
  {
    crn: '3567890743',
    firstName: 'Farmer',
    lastName: 'Gill',
    email: 'Gill@testnull.com',
    landlinePhone: '076575678',
    mobilePhone: '076575678',
    businesSize: 'Micro',
    numberOfEmployees: 7,
    areasManaged: {
      agricultural: '25 Hectares',
      horticultural: '10 Hectares',
      woodland: '5 Hectares'
    },
    registeredOwner: 'Farmer Gill',
    gender: 'Female',
    address: 'Berry Farm, Norfolk, NO4 3RF',
    businessType: 'Farm',
    activity: 'Arable Farm',
    companies: [
      {
        name: 'Berry Farm',
        id: 'berry-farm',
        sbi: '786756789',
        parcels: []
      }
    ]
  },
  {
    crn: '7892345678',
    firstName: 'Farmer',
    lastName: 'Tom',
    email: 'Tom@testnull.com',
    landlinePhone: '086127891',
    mobilePhone: '034567891',
    businesSize: 'Micro',
    numberOfEmployees: 6,
    areasManaged: {
      agricultural: '15 Hectares',
      horticultural: '5 Hectares',
      woodland: '10 Hectares'
    },
    registeredOwner: 'Farmer Tom',
    gender: 'Male',
    address: 'Green Farm, Devon, DV6 4RH',
    businessType: 'Farm',
    activity: 'Arable Farm',
    companies: [
      {
        name: 'Green Farm',
        id: 'green-farm',
        sbi: '767892234',
        parcels: []
      }
    ]
  }
]
