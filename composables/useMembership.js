import { useDialog } from "primevue/usedialog"
import { useToast } from "primevue/usetoast"

export const useMembership = () => {

  const dialog = useDialog()
  const toast = useToast()
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
  const config = useRuntimeConfig()

  const springboardLink = config.public.SPRINGBOARD_URL
  const donationLink = "https://pledge.wnyc.org/support/wnyc"


  // Handle the "Cancel membership" emit click event
  const onCancelMembershipThankYou = async () => {
    const { default: CancelMembership } = await import(
      "~/components/account-modals/CancelMembershipThankYou.vue"
    )

    dialog.open(CancelMembership, {
      props: dialogProps,
    })
  }

  // Handle the onContactListenerServices emit click event on the Tell Us" buttons
  const onContactListenerServices = async () => {
    console.log("Contact Listener Services clicked")
    const { default: ContactListenerServices } = await import(
      "~/components/account-modals/ContactListenerServices.vue"
    )

    dialog.open(ContactListenerServices, {
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
        onCancel: async () => {
          console.log("canceled emit dialog")
          //actually CANCEL the membership here
          const { authenticatedFetch } = useAuth()
          const requestBody = { did: springboardId, reason: "User requested cancellation via WNYC account portal." }

          const data = await authenticatedFetch(`${config.public.BFF_URL}/api/donation/cancel`, {
            method: 'POST',
            body: requestBody,
          })

          if (data?.error) {
            toast.add({
              severity: "error",
              summary: "There was an error canceling your membership. Please try again later.",
              life: 8000,
              closable: true,
            })
            return
          } else {
            // Successfully canceled membership
            onCancelMembershipThankYou()
            toast.add({
              severity: "success",
              summary:
                "Your membership donation has been successfully canceled.",
              closable: true,
            })
          }
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
          toast.add({
            severity: "success",
            summary:
              `Your donation has been successfully updated to $${e.amount}/mo.`,
            life: 6000,
            closable: true,
          })
        },
      },
    })
  }

  // handle the "Donate now" emit click event
  const onDonateNow = (utmParams = { utm_source: "wnyc", utm_medium: "wnyc", utm_campaign: "donate-button" }) => {
    const queryString = new URLSearchParams(utmParams).toString()
    window.open(
      `${donationLink}?${queryString}`,
      "_blank"
    )
  }

  //onChangePaymentInfo
  const onChangePaymentInfo = (queryStringEncrypted) => {
    const url = `${springboardLink}?=${queryStringEncrypted}`
    window.open(url, "_blank")
  }

  return { onCancelMembership, onUpdateGiftAmount, onDonateNow, onContactListenerServices, onChangePaymentInfo }
}



