import { useDialog } from "primevue/usedialog"


export const useMembership = () => {

  const dialog = useDialog()
  const dialogStyles = {
    width: "100%",
    maxWidth: "672px",
    padding: "1.75rem 1rem 1rem 1rem",
    borderRadius: "0",
  }
  const dialogProps = {
    showHeader: false,
    style: dialogStyles,
    draggable: false,
    dismissableMask: true,
    modal: true,
  }
  // Handle the "Cancel membership" emit click event
  const onCancelMembershipThankYou = async () => {
    const { default: CancelMembership } = await import(
      "~/components/account-modals/CancelMembershipThankYou.vue"
    )

    dialog.open(CancelMembership, {
      props: dialogProps,
    })
  }

  // Handle the "Cancel membership" emit click event
  const onCancelMembership = async (springboardId, amount) => {
    console.log("Cancel membership clicked for ID:", springboardId)

    const { default: CancelMembership } = await import(
      "~/components/account-modals/CancelMembership.vue"
    )

    dialog.open(CancelMembership, {
      data: {
        springboardId: springboardId,
      },
      props: dialogProps,
      emits: {
        onCancel: () => {
          console.log("canceled emit dialog")
          onCancelMembershipThankYou()
        },
        onAdjust: (e) => {
          onUpdateGiftAmount(amount)
          console.log("sent to adjust/update the amount")
        },
      },
    })
  }

  // Handle the "onUpdateGiftAmount" emit click event
  const onUpdateGiftAmount = async (currentDonationAmount) => {
    console.log("Update gift amount :", currentDonationAmount)

    const { default: AdjustDonation } = await import(
      "~/components/account-modals/AdjustDonation.vue"
    )

    dialog.open(AdjustDonation, {
      data: {
        currentDonationAmount: currentDonationAmount,
      },
      props: dialogProps,
      emits: {
        onCancel: () => {
          console.log("canceled emit dialog")
        },
        onSave: (e) => {
          console.log("adjusted", e)
        },
      },
    })
  }

  // handle the "Donate now" emit click event
  const onDonateNow = () => {
    window.open(
      "https://pledge.wnyc.org/support/wnyc?utm_source=wnyc&utm_medium=wnyc&utm_campaign=donate-button",
      "_blank"
    )
  }

  return { onCancelMembership, onUpdateGiftAmount, onDonateNow }
}



