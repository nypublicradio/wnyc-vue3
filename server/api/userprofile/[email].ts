/**
 * Stub user profile service
 * donor value is hard-coded to true iff email is bono ;)
 * URL structure will be like /api/userprofile/tbono@wnyc.org
 */
export default defineEventHandler(async (event) => {
	console.log(event)
	const email = event.context.params.email
	return {
		email: email,
		isDonor: "tbono@wnyc.org" === email,
		defaultStream: "WNYCAM"
	}
})