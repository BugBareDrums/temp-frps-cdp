// eslint-disable-next-line n/no-unpublished-import
import { faker } from '@faker-js/faker'

const farmers = Array.from({ length: 5000 }, () => ({
  name: `${faker.person.firstName()} ${faker.person.lastName()}`
}))

export { farmers }
