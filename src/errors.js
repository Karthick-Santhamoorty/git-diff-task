export function NotFound(){
    return (
        <div className="d-flex justify-content-center align-items-center h-100 text-muted">
            <div>
                <h4 className="text-center">404</h4>
                <p>The Requested URL Not Found</p>
            </div>
        </div>
    )
}

export function InternalError(){
    return (
        <div className="d-flex justify-content-center align-items-center h-100 text-muted">
            <div>
                <h4 className="text-center">500</h4>
                <p>Internal Error</p>
            </div>
        </div>
    )
}