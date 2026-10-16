import { describe, expect, it } from "vitest";
import { validateCheckoutInput } from "@/lib/checkout/validation";

const validInput = {
  fullName: "  Test Customer  ",
  phone: "+92 300-1234567",
  city: "  Lahore ",
  address: "  12 Example Street  ",
  paymentMethod: "cod",
  items: [{ variantId: "123e4567-e89b-42d3-a456-426614174000", quantity: 2, price: 1, admin: true }],
};

const invalidItemCases: Array<{ items: unknown }> = [
  { items: [] },
  { items: null },
  { items: [null] },
  { items: [{}] },
  { items: Array.from({ length: 101 }, () => validInput.items[0]) },
  { items: [{ variantId: "not-a-uuid", quantity: 1 }] },
  { items: [{ variantId: "123e4567-e89b-42d3-a456-426614174000", quantity: 0 }] },
  { items: [{ variantId: "123e4567-e89b-42d3-a456-426614174000", quantity: 1.5 }] },
  { items: [{ variantId: "123e4567-e89b-42d3-a456-426614174000", quantity: Number.MAX_SAFE_INTEGER + 1 }] },
];

describe("checkout input validation", () => {
  it("trims required text and outputs only safe RPC item fields", () => {
    const result = validateCheckoutInput(validInput);
    expect(result.value).toEqual({
      fullName: "Test Customer",
      phone: "+92 300-1234567",
      city: "Lahore",
      address: "12 Example Street",
      paymentMethod: "cod",
      items: [{ variant_id: "123e4567-e89b-42d3-a456-426614174000", quantity: 2 }],
    });
    expect(Object.keys(result.value!.items[0]!)).toEqual(["variant_id", "quantity"]);
  });

  it.each(["cod", "jazzcash"]) ("accepts supported payment method %s", (paymentMethod) => {
    expect(validateCheckoutInput({ ...validInput, paymentMethod }).value?.paymentMethod).toBe(paymentMethod);
  });

  it.each(["", "   ", "x".repeat(121)])("rejects missing or oversized required name %j", (fullName) => {
    expect(validateCheckoutInput({ ...validInput, fullName }).value).toBeUndefined();
  });

  it.each([{ phone: "  " }, { city: "  " }, { address: "  " }])("rejects blank trimmed required fields", (overrides) => {
    expect(validateCheckoutInput({ ...validInput, ...overrides }).error).toBe("Please fill in all delivery details.");
  });

  it.each(["abc", "123456789", "12345678901234", "+1 23x4567890"])("rejects invalid phone %s", (phone) => {
    expect(validateCheckoutInput({ ...validInput, phone }).error).toBe("Enter a valid phone number with 10 to 13 digits.");
  });

  it("rejects unsupported payment method", () => {
    expect(validateCheckoutInput({ ...validInput, paymentMethod: "card" }).error).toBe("Please choose a valid payment method.");
  });

  it.each(invalidItemCases)("rejects empty, oversized, or malformed items", ({ items }) => {
    expect(validateCheckoutInput({ ...validInput, items }).error).toBe("Your cart is empty or contains invalid items.");
  });
});
