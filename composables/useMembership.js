import { useDialog } from "primevue/usedialog"
import { useToast } from "primevue/usetoast"

// Composable for handling membership-related actions and dialogs
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
    modal: false,
    breakpoints: { '768px': '90vw' },
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
    const { default: ContactListenerServices } = await import(
      "~/components/account-modals/ContactListenerServices.vue"
    )

    dialog.open(ContactListenerServices, {
      props: dialogProps,
    })
  }


  // Handle the "onUpdateGiftAmount" emit click event
  const onUpdateGiftAmount = async (currentDonationAmount) => {
    //console.log("Update gift amount :", currentDonationAmount)

    const { default: AdjustDonation } = await import(
      "~/components/account-modals/AdjustDonation.vue"
    )

    dialog.open(AdjustDonation, {
      data: {
        currentDonationAmount,
      },
      props: dialogProps,
      emits: {
        onCancel: () => {
          console.error("canceled emit dialog")
        },
        onSave: (e) => {
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

  // Handle the "Cancel membership" emit click event
  const onCancelMembership = async (springboardId, amount) => {
    //console.log("Cancel membership clicked for ID:", springboardId)

    const { default: CancelMembership } = await import(
      "~/components/account-modals/CancelMembership.vue"
    )

    dialog.open(CancelMembership, {
      data: {
        springboardId,
      },
      props: dialogProps,
      emits: {
        onCancel: async () => {
          //onCancelMembershipThankYou()
          //actually CANCEL the membership here
          const { authenticatedFetch } = useAuth()
          const requestBody = { did: springboardId, reason: "User requested cancellation via WNYC account dashboard Member Center." }

          try {
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
          } catch (error) {
            console.error('Cancel membership error:', error)
            toast.add({
              severity: "error",
              summary: "There was an error canceling your membership. Please try again later.",
              life: 8000,
              closable: true,
            })
          }
        },
        onAdjust: () => {
          onUpdateGiftAmount(amount)
          //console.log("sent to adjust/update the amount")
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

  return { onCancelMembership, onUpdateGiftAmount, onDonateNow, onContactListenerServices, onChangePaymentInfo, dialogProps }
}



