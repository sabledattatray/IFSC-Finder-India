export interface LocationNode {
  state: string;
  districts: {
    [districtName: string]: {
      cities: {
        [cityName: string]: {
          pincodes: {
            [pincode: string]: {
              banks: {
                [bankName: string]: {
                  branchName: string;
                  address: string;
                  ifsc: string;
                }[];
              };
            };
          };
        };
      };
    };
  };
}

// NOTE: A complete real-world RBI database contains over 150,000+ branches. 
// Hardcoding the entire dataset inside the frontend codebase would crash the browser 
// (the JSON alone is tens of megabytes). 
// This expanded dataset provides a robust proof-of-concept for the cascading UI.
// As per the PRD (Phase 2), a full PostgreSQL backend will eventually serve the complete directory.
export const localBankDatabase: LocationNode[] = [
  {
    state: "MAHARASHTRA",
    districts: {
      "MUMBAI": {
        cities: {
          "DADAR": {
            pincodes: {
              "400028": {
                banks: {
                  "ICICI BANK LTD": [
                    {
                      branchName: "DADAR (W)",
                      address: "SURVEY NUMBER 1435, GROUND FLOOR CELESTIAL BUILDING, GOKHALE ROAD, NEAR SHIVSENA BHAVAN, DADAR (W), MUMBAI, MAHARASHTRA-400028",
                      ifsc: "ICIC0001000"
                    }
                  ],
                  "STATE BANK OF INDIA": [
                    {
                      branchName: "DADAR WEST",
                      address: "DHARAMKUTIR, M C JAWLE MARG, DADAR WEST, MUMBAI",
                      ifsc: "SBIN0005349"
                    }
                  ]
                }
              }
            }
          },
          "ANDHERI": {
            pincodes: {
              "400053": {
                banks: {
                  "HDFC BANK": [
                    {
                      branchName: "ANDHERI WEST",
                      address: "GROUND FLOOR, ANDHERI WEST, MUMBAI",
                      ifsc: "HDFC0000019"
                    }
                  ]
                }
              }
            }
          }
        }
      },
      "PUNE": {
         cities: {
           "PUNE CITY": {
             pincodes: {
               "411001": {
                 banks: {
                   "STATE BANK OF INDIA": [
                     {
                       branchName: "PUNE MAIN",
                       address: "DHARMAVEER SAMBHAJI MARG, PUNE",
                       ifsc: "SBIN0000454"
                     }
                   ],
                   "HDFC BANK": [
                     {
                       branchName: "CAMP PUNE",
                       address: "PLOT NO 5, MG ROAD, CAMP, PUNE",
                       ifsc: "HDFC0000127"
                     }
                   ]
                 }
               }
             }
           }
         }
      },
      "AHMEDNAGAR": {
         cities: {
           "AHMEDNAGAR CITY": {
             pincodes: {
               "414001": {
                 banks: {
                   "STATE BANK OF INDIA": [
                     {
                       branchName: "AHMEDNAGAR MAIN",
                       address: "MG ROAD, AHMEDNAGAR, MAHARASHTRA",
                       ifsc: "SBIN0000303"
                     }
                   ],
                   "ICICI BANK LTD": [
                      {
                        branchName: "AHMEDNAGAR",
                        address: "AMBER PLAZA, STATION ROAD, AHMEDNAGAR",
                        ifsc: "ICIC0000171"
                      }
                   ]
                 }
               }
             }
           }
         }
      }
    }
  },
  {
    state: "KARNATAKA",
    districts: {
      "BENGALURU URBAN": {
        cities: {
          "BENGALURU": {
             pincodes: {
               "560001": {
                 banks: {
                   "STATE BANK OF INDIA": [
                     {
                       branchName: "BENGALURU MAIN",
                       address: "POST BAG NO 5310, ST.MARKS ROAD, BENGALURU",
                       ifsc: "SBIN0000813"
                     }
                   ],
                   "AXIS BANK": [
                      {
                        branchName: "M G ROAD",
                        address: "9, M G ROAD, BLOCK A, BENGALURU",
                        ifsc: "UTIB0000009"
                      }
                   ]
                 }
               }
             }
          }
        }
      }
    }
  },
  {
     state: "DELHI",
     districts: {
         "NEW DELHI": {
             cities: {
                 "CONNAUGHT PLACE": {
                     pincodes: {
                         "110001": {
                             banks: {
                                 "HDFC BANK": [
                                     {
                                         branchName: "CONNAUGHT PLACE",
                                         address: "G-3/4, SURYA KIRAN BUILDING, 19, KASTURBA GANDHI MARG",
                                         ifsc: "HDFC0000003"
                                     }
                                 ],
                                 "STATE BANK OF INDIA": [
                                     {
                                         branchName: "PARLIAMENT STREET",
                                         address: "11, PARLIAMENT STREET, NEW DELHI",
                                         ifsc: "SBIN0000691"
                                     }
                                 ]
                             }
                         }
                     }
                 }
             }
         }
     }
  },
  {
    state: "GUJARAT",
    districts: {
      "AHMEDABAD": {
        cities: {
          "AHMEDABAD CITY": {
            pincodes: {
              "380009": {
                banks: {
                  "ICICI BANK LTD": [
                    {
                      branchName: "NAVRANGPURA",
                      address: "JMC HOUSE, OPP PARIMAL GARDENS, AMBAWADI",
                      ifsc: "ICIC0000024"
                    }
                  ]
                }
              }
            }
          }
        }
      }
    }
  }
];
