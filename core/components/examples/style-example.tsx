"use client"

import { Text } from "@/core/components/ui/text"

export function StyleExample() {
  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="heading-h2-bold mb-4">Typography Examples</h2>
        <div className="space-y-2">
          <Text variant="headingH1">Heading H1 (46px Bold)</Text>
          <Text variant="headingH2Bold">Heading H2 Bold (32px Bold)</Text>
          <Text variant="headingH3">Heading H3 (24px Bold)</Text>
          <Text variant="paragraphP1Bold">Paragraph P1 Bold (18px Bold)</Text>
          <Text variant="paragraphP2Regular">Paragraph P2 Regular (16px Regular)</Text>
          <Text variant="captionRegular">Caption Regular (12px Regular)</Text>
        </div>
      </div>

      <div>
        <h2 className="heading-h2-bold mb-4">Color Examples</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-md bg-primary-500"></div>
            <p className="mt-2 paragraph-p5-regular">Primary 500</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-md bg-accent-500"></div>
            <p className="mt-2 paragraph-p5-regular">Accent 500</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-md bg-neutrals-800"></div>
            <p className="mt-2 paragraph-p5-regular">Neutrals 800</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-md bg-pending"></div>
            <p className="mt-2 paragraph-p5-regular">Pending</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="heading-h2-bold mb-4">Gradient Examples</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center">
            <div className="w-full h-20 rounded-md bg-inactive-cat"></div>
            <p className="mt-2 paragraph-p5-regular">Inactive Cat Gradient</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-full h-20 rounded-md bg-cat-tab-linear"></div>
            <p className="mt-2 paragraph-p5-regular">Cat Tab Linear Gradient</p>
          </div>
        </div>
      </div>
    </div>
  )
}
